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
  MessageDeleteDataModel,
  MessageEditDataModel,
} from "../models/MessageDataModel";
import ChatModel from "../database/models/ChatModel";
import ErrorHandler from "../exceptions/error-handler";
import MessageModel from "../database/models/MessageModel";
import { ChatEventEnum } from "../socket/constant";
import { ChatType } from "../enums/action.enum";
import ChatParticipantModel from "../database/models/ChatParticipantModel";
import { Op } from "sequelize";
import ChatDto, { ChatParticipantDto } from "../dtos/ChatDto";
import MessageEditModel from "../database/models/MessageEditModel";
import MessageDeleteModel from "../database/models/MessageDeleteModel";
import PlainDto from "../dtos/PlainDto";

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

  async editMessage(
    messageId: number,
    chatId: number,
    editMassages: string
  ): Promise<Response<MessageDto>> {
    try {
      const message = await MessageModel.findOne({
        where: {
          id: messageId,
          chatId: chatId,
          isActive: true,
          isDeleted: false,
        },
      });

      const currentMessage = message as MessageDto | null;

      if (!message) {
        return {
          success: false,
          status: 400,
          message: "Message not found.",
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

      const updatePayload: Partial<MessageDataModel> = {};
      updatePayload.chatId = chat.id;
      updatePayload.message = editMassages;
      updatePayload.messageType = "TEXT";

      const [affectedCount, updatedRows] = await MessageModel.update(
        updatePayload,
        {
          where: {
            chatId: chat.id,
            messageId: message.dataValues.id,
            isActive: true,
            isDeleted: false,
          },
          returning: true,
        }
      );

      if (!affectedCount && !updatedRows) {
        return {
          success: false,
          status: 400,
          message: "Some error occurred while updating the message",
        };
      }

      const addPayload: Partial<MessageEditDataModel> = {};
      if (currentMessage) {
        addPayload.messageId = currentMessage.id || 0;
        addPayload.oldMessage = currentMessage?.message;
        addPayload.newMessage = editMassages;
        addPayload.createdBy = this.currentUserGuid;
        addPayload.isActive = true;
        addPayload.isDeleted = false;
      }

      const messageUpdateStatus = await MessageEditModel.create(addPayload);

      if (messageUpdateStatus) {
        return {
          success: false,
          status: 400,
          message: "Some error occurred while adding the message status",
        };
      }

      const response = updatedRows[0] as unknown as MessageDto;

      if (response && affectedCount > 0 && messageUpdateStatus) {
        return {
          success: true,
          status: 200,
          message: "Message edited successfully!",
          data: response,
        };
      } else {
        return {
          success: false,
          status: 400,
          message: "Some error occurred while editing the message",
          data: response,
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

  async deleteMessage(
    chatId: number,
    messageId: number
  ): Promise<Response<PlainDto>> {
    try {
      const message = await MessageModel.findOne({
        where: {
          id: messageId,
          chatId: chatId,
          isActive: true,
          isDeleted: false,
        },
      });

      if (!message) {
        return {
          success: false,
          status: 400,
          message: "Message not found.",
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

      const updatePayload: Partial<MessageBasicDataModel> = {};
      updatePayload.isActive = false;
      updatePayload.isDeleted = true;

      const [affectedCount, updatedRows] = await MessageModel.update(
        updatePayload,
        {
          where: {
            id: message.dataValues.id,
            chatId: chat.id,
            isActive: true,
            isDeleted: false,
          },
          returning: true,
        }
      );

      if (!affectedCount && !updatedRows) {
        return {
          success: false,
          status: 400,
          message: "Some error occurred while deleting the message",
        };
      }

      const updateDeletePayload: Partial<MessageDeleteDataModel> = {};
      updateDeletePayload.messageId = message.dataValues.id;
      updateDeletePayload.deletedBy = this.currentUserGuid;
      updateDeletePayload.createdBy = this.currentUserGuid;

      const deleteMessageStatus = await MessageDeleteModel.create(
        updateDeletePayload
      );

      if (!deleteMessageStatus) {
        return {
          success: false,
          status: 400,
          message: "Some error occurred while deleting the message",
        };
      }

      let response;
      if (affectedCount > 0 && updatedRows) {
        response = {
          count: affectedCount,
          message: "Message deleted successfully.",
        } as PlainDto;
      } else {
        response = {
          count: 0,
          message: "Some error occurred while deleting the message",
        } as PlainDto;
      }

      if (affectedCount > 0 && response) {
        return {
          success: false,
          status: 204,
          message: "Message deleted successfully.",
          data: response,
        };
      } else {
        return {
          success: false,
          status: 400,
          message: "Some error occurred while deleting the message",
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
