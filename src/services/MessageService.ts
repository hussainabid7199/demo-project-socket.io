import { inject, injectable } from "inversify";
import IUserService from "./interface/IUserService";
import IMiscellaneousService from "./interface/IMiscellaneousService";
import { TYPES } from "../config/types";
import { CurrentUserDto, UserBasicDto } from "../dtos/UserDto";
import { SocketServer } from "../socket";
import IChatService from "./interface/IChatService";
import IMessageService from "./interface/IMessageService";
import { MessageDto } from "../dtos/MessageDto";
import Response from "../dtos/Response";
import UserModel from "../database/models/UserModel";
import {
  MessageBasicDataModel,
  MessageDataModel,
} from "../models/MessageDataModel";
import ChatModel from "../database/models/ChatModel";
import ErrorHandler from "../exceptions/error-handler";
import MessageModel from "../database/models/MessageModel";
import { ChatEventEnum } from "../socket/constant";
import { ChatType } from "../enums/action.enum";
import ChatParticipantModel from "../database/models/ChatParticipantModel";
import { Op } from "sequelize";
import ChatDto, { ChatParticipantDto } from "../dtos/ChatDto";

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

  async message(
    chatId: number,
    userId: number
  ): Promise<Response<MessageDto[]>> {
    try {
      const user = (await UserModel.findOne({
        where: { id: userId },
        raw: true,
      })) as UserBasicDto | null;

      if (!user) {
        return {
          success: false,
          status: 400,
          message: "Sender not found.",
        };
      }

      const chat = (await ChatModel.findOne({
        where: {
          id: chatId,
          isActive: true,
          isDeleted: false,
        },
        raw: true,
      })) as ChatDto | null;

      if (!chat) {
        return {
          success: false,
          status: 400,
          message: "Chat not found.",
        };
      }

      if (chat.type === ChatType.PRIVATE) {
        const participant = (await ChatParticipantModel.findOne({
          where: {
            chatId: chat.id,
            userId: {
              [Op.in]: [this.currentUserId, user.id],
            },
            isActive: true,
            isDeleted: false,
          },
          raw: true,
        })) as ChatParticipantDto | null;

        if (!participant) {
          return {
            success: false,
            status: 400,
            message: "Receiver not found.",
          };
        }
      }

      const response = (await MessageModel.findAll({
        where: {
          chatId: chat.id,
        },
      })) as unknown as MessageDto[];

      if (response.length > 0) {
        return {
          success: true,
          status: 200,
          message: "Message fetched successfully.",
          data: response,
        };
      } else {
        return {
          success: false,
          status: 400,
          message: "Message failed to fetched.",
        };
      }
    } catch (error) {
      return ErrorHandler.Handle(
        error,
        "DATABASE_ERROR",
        400,
        "Some error occurred while sending messages"
      );
    }
  }

  async sendMessage(model: MessageDataModel): Promise<Response<MessageDto>> {
    try {
      const user = (await UserModel.findOne({
        where: { id: this.currentUserId },
        raw: true,
      })) as UserBasicDto | null;

      if (!user) {
        return {
          success: false,
          status: 400,
          message: "Sender not found.",
        };
      }

      const chat = (await ChatModel.findOne({
        where: {
          id: model.chatId,
          isActive: true,
          isDeleted: false,
        },
        raw: true,
      })) as ChatDto | null;

      if (!chat) {
        return {
          success: false,
          status: 400,
          message: "Chat not found.",
        };
      }

      if (chat && chat.type === ChatType.PRIVATE) {
        const participant = (await ChatParticipantModel.findOne({
          where: {
            chatId: chat.id,
            userId: {
              [Op.not]: [this.currentUserId],
            },
            isActive: true,
            isDeleted: false,
          },
          raw: true,
        })) as ChatParticipantDto | null;

        if (!participant) {
          return {
            success: false,
            status: 400,
            message: "Receiver not found.",
          };
        }

        this.io.emitSocketEvent(chat.roomId, ChatEventEnum.NEW_CHAT_EVENT, {
          message: model.message,
          messageType: model.messageType,
          chatId: chat.id,
          senderId: this.currentUserId,
          receiverId: participant.userId,
          chatType: ChatType.PRIVATE,
        });
      }

      const messageModel: MessageBasicDataModel = {
        chatId: chat.id,
        senderId: this.currentUserId,
        message: model.message,
        messageType: model.messageType,
        createdBy: this.currentUserGuid,
        isActive: true,
        isDeleted: false,
      };

      const { ...dbModel } = messageModel;

      const response = (await MessageModel.create(dbModel)).dataValues;

      if (response) {
        return {
          success: true,
          status: 200,
          message: "Message send successfully!",
          data: response,
        };
      } else {
        return {
          success: false,
          status: 400,
          message: "Failed to send message.",
        };
      }
    } catch (error) {
      return ErrorHandler.Handle(
        error,
        "DATABASE_ERROR",
        400,
        "Some error occurred while sending messages"
      );
    }
  }
}
