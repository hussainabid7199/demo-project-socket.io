import { inject, injectable } from "inversify";
import IMessageService from "./interface/IMessageService";
import { MessageDto, MessageSendDto } from "../dtos/MessageDto";
import Response from "../dtos/Response";
import IUserService from "./interface/IUserService";
import IMiscellaneousService from "./interface/IMiscellaneousService";
import { TYPES } from "../config/types";
import { CurrentUserDto } from "../dtos/UserDto";
import { SocketServer } from "../socket";
import { ChatEventEnum } from "../socket/constant";
import MessageModel from "../database/models/MessageModel";
import { MessageDataModel } from "../models/MessageDataModel";
import sequelize from "../database/connection";
import IChatService from "./interface/IChatService";

@injectable()
export default class MessageService implements IMessageService {
  private readonly userService: IUserService;
  private readonly chatService: IChatService;
  private readonly miscellaneousService: IMiscellaneousService;
  private readonly currentUser: CurrentUserDto;
  private readonly currentUserGuid: string;
  private readonly currentUserId: number;

  constructor(
    @inject(TYPES.SocketServer) private io: SocketServer,
    @inject(TYPES.IChatService) chatService: IChatService,
    @inject(TYPES.IMiscellaneousService)
    miscellaneousService: IMiscellaneousService,
    @inject(TYPES.IUserService) userService: IUserService
  ) {
    this.userService = userService;
    this.chatService = chatService;
    this.miscellaneousService = miscellaneousService;
    this.currentUser = this.miscellaneousService.currentUser();
    this.currentUserGuid = this.currentUser.guid;
    this.currentUserId = this.currentUser.id;
  }

  async sendMessage(
    chatId: number,
    receiverId: number,
    payload: string | File
  ): Promise<Response<MessageSendDto>> {
    const message: MessageSendDto = {
      chatId: chatId,
      receiverId: receiverId,
      senderId: this.currentUserId,
      payload: payload,
    };

    this.io.emitSocketEvent(
      this.currentUserGuid,
      ChatEventEnum.NEW_CHAT_EVENT,
      message
    );

    const t = await sequelize.transaction();
    try {
      const model: MessageDataModel = {
        chatContactId: message.chatId,
        message: message.payload,
        currentUserId: message.senderId || this.currentUserId,
        createdBy: this.currentUserGuid,
        isActive: true,
        isDeleted: false,
      };

      const { ...dbModel } = model;

      const response = (await MessageModel.create(dbModel)).dataValues;

      if (response) {
        await t.commit();
        return {
          success: true,
          status: 200,
          message: "Message saved and sent successfully",
          data: response,
        };
      } else {
        await t.rollback();
        return {
          success: false,
          status: 400,
          message: "Message failed to saved.",
        };
      }
    } catch (error) {
      await t.rollback();
      console.error("Error while sending or saving messages:", error);
      return {
        success: false,
        message: `Error while sending or saving messages: ${error}`,
      };
    }
  }

  async getAllMessages(userId: number): Promise<Response<MessageDto[]>> {
    const chatExistResponse = await this.chatService.chatExist(userId);

    if (chatExistResponse && chatExistResponse.status != 200) {
      return {
        success: false,
        status: 400,
        message: "Chat don't exist, please create a new chat.",
      };
    }

    const messages = await MessageModel.findAll({
      where: { chatContactId: chatExistResponse.data?.chatId },
    });

    const response: MessageDto[] = messages.map((x) => {
      const message: MessageDto = x.dataValues;
      return {
        id:message.id,
        chatContactId: message.chatContactId,
        groupId: message.groupId,
        groupMemberId: message.groupMemberId,
        currentUserId: message.currentUserId,
        message: message.message,
        createdAt: message.createdAt,
        createdBy: message.createdBy,
        updatedAt: message.updatedAt,
        updatedBy: message.updatedBy,
        isActive: message.isActive,
        isDeleted: message.isDeleted,
      };
    });

    if (response) {
        return {
          success: true,
          status: 200,
          message: "Message fetched successfully",
          data: response,
        };
      } else {
        return {
          success: false,
          status: 400,
          message: "Message failed fetch.",
        };
      }
  }
}
