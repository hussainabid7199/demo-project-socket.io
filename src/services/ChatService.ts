import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import IChatService from "./interface/IChatService";
import Response from "../dtos/Response";
import ChatDto, { ChatParticipantDto } from "../dtos/ChatDto";
import IUserService from "./interface/IUserService";
import {
  ChatActionDataModel,
  ChatContactDataModel,
  ChatParticipantDataModel,
} from "../models/ChatDataModel";
import { CurrentUserDto, UserBasicDto } from "../dtos/UserDto";
import IMiscellaneousService from "./interface/IMiscellaneousService";
import { SocketServer } from "../socket";
import { ChatEventEnum } from "../socket/constant";
import UserModel from "../database/models/UserModel";
import ChatModel from "../database/models/ChatModel";
import { Optional } from "sequelize";
import { generateUniqueId } from "../helpers/generate-unique-id";
import ChatParticipantModel from "../database/models/ChatParticipantModel";
import {
  ChatAction,
  ChatType,
  GroupActionStatus,
  MessagePermission,
} from "../enums/action.enum";
import { GroupDataModel } from "../models/GroupDataModel";
import logError from "../utils/error-logging";

@injectable()
export default class ChatService implements IChatService {
  private readonly userService: IUserService;
  private readonly miscellaneousService: IMiscellaneousService;
  private readonly currentUser: CurrentUserDto;
  private readonly currentUserId: number;
  private readonly currentUserGuid: string;

  constructor(
    @inject(TYPES.SocketServer) private io: SocketServer,
    @inject(TYPES.IUserService) userService: IUserService,
    @inject(TYPES.IMiscellaneousService)
    miscellaneousService: IMiscellaneousService
  ) {
    this.userService = userService;
    this.miscellaneousService = miscellaneousService;
    this.currentUser = this.miscellaneousService.currentUser();
    this.currentUserId = this.currentUser.id;
    this.currentUserGuid = this.currentUser.guid;
  }

  async oneToOneChat(userId: number): Promise<Response<ChatDto>> {
    try {
      const user = (await UserModel.findOne({
        where: { id: userId },
        raw: true,
      })) as UserBasicDto | null;

      if (!user) {
        return {
          success: false,
          status: 400,
          message: "Some error occurred while creating chat",
        };
      }

      const roomId = `${this.currentUserId}_${user.id}`;
      const model: ChatContactDataModel = {
        roomId: roomId,
        type: ChatType.PRIVATE,
        createdBy: this.currentUserGuid,
      };

      const chatExist = await ChatModel.findOne({
        where: {
          roomId: roomId,
          isActive: true,
          isDeleted: false,
        },
        raw: true,
      });

      let response;
      if (chatExist) {
        this.io.emitSocketEvent(
          this.currentUserGuid,
          ChatEventEnum.NEW_CHAT_EVENT,
          model
        );
        response = model;
      } else {
        const { ...dbModel } = model;

        response = (await ChatModel.create(dbModel)).dataValues;

        const oneToOnParticipant: ChatParticipantDataModel[] = [
          {
            chatId: response.id,
            userId: this.currentUserId,
            isActive: true,
            isArchived: false,
            isBlocked: false,
            isMuted: false,
            isAdmin: false,
            isDeleted: false,
            createdBy: this.currentUserGuid,
          },
          {
            chatId: response.id,
            userId: user.id,
            isActive: true,
            isArchived: false,
            isBlocked: false,
            isMuted: false,
            isAdmin: false,
            isDeleted: false,
            createdBy: this.currentUserGuid,
          },
        ];

        await ChatParticipantModel.bulkCreate(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          oneToOnParticipant as unknown as Optional<any, string>[]
        );
      }

      if (response) {
        return {
          success: true,
          status: 200,
          message: "Chat created successfully!",
          data: response,
        };
      } else {
        return {
          success: false,
          status: 400,
          message: "Failed to create chat.",
        };
      }
    } catch (error) {
      logError({
        error: error,
        errorType: "DATABASE_ERROR",
      });

      return {
        success: false,
        status: 400,
        message: "Some error occurred while creating chat",
      };
    }
  }

  async groupChat(model: GroupDataModel): Promise<Response<ChatDto>> {
    try {
      const groupUniqueId = await generateUniqueId();

      const chatModel: ChatContactDataModel = {
        roomId: groupUniqueId,
        type: ChatType.GROUP,
        name: model.name,
        description: model.description,
        createdBy: this.currentUserGuid,
      };

      const { ...dbModel } = chatModel;

      this.io.emitSocketEvent(
        this.currentUserGuid,
        ChatEventEnum.NEW_CHAT_EVENT,
        dbModel
      );

      const response = (await ChatModel.create(dbModel)).dataValues;
      const adminUser: ChatParticipantDataModel[] = [
        {
          chatId: response.id,
          userId: this.currentUserId,
          isActive: true,
          isArchived: false,
          isBlocked: false,
          isMuted: false,
          isAdmin: true,
          isDeleted: false,
          createdBy: this.currentUserGuid,
        },
      ];

      let groupParticipant;
      if (model.participant && model.participant.length > 0) {
        const participantModel: ChatParticipantDataModel[] = [];
        const currentParticipant: ChatParticipantDataModel[] =
          model.participant.map((x) => {
            return {
              chatId: response.id,
              userId: x,
              isActive: true,
              isArchived: false,
              isBlocked: false,
              isMuted: false,
              isAdmin: false,
              isDeleted: false,
              createdBy: this.currentUserGuid,
            } as ChatParticipantDataModel;
          });
        participantModel.push(...adminUser, ...currentParticipant);
        groupParticipant = await ChatParticipantModel.bulkCreate(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          participantModel as unknown as Optional<any, string>[]
        );
      }

      if (response && groupParticipant) {
        return {
          success: true,
          status: 200,
          message: "Chat created successfully!",
          data: response,
        };
      } else {
        return {
          success: false,
          status: 400,
          message: "Failed to create chat.",
        };
      }
    } catch (error) {
      logError({
        error: error,
        errorType: "DATABASE_ERROR",
      });

      return {
        success: false,
        status: 400,
        message: "Some error occurred while creating group chat",
      };
    }
  }

  async chatAction(
    model: ChatActionDataModel
  ): Promise<Response<ChatParticipantDto>> {
    try {
      const user = (await UserModel.findOne({
        where: { userId: model.userId },
        raw: true,
      })) as UserBasicDto | null;

      if (!user) {
        return {
          success: false,
          status: 400,
          message: "User not found!",
        };
      }

      const chat = (await ChatModel.findOne({
        where: { chatId: model.chatId },
        raw: true,
      })) as ChatDto | null;

      if (!chat) {
        return {
          success: false,
          status: 400,
          message: "Chat not found!",
        };
      }

      const participant = await ChatParticipantModel.findOne({
        where: {
          chatId: model.chatId,
          userId: user.id,
          isActive: true,
          isDeleted: false,
          isBlocked: false,
        },
      });

      const isCurrentUserParticipant = await ChatParticipantModel.findOne({
        where: {
          chatId: model.chatId,
          userId: this.currentUserId,
          isActive: true,
          isDeleted: false,
          isBlocked: false,
        },
      });

      const updatePayload: Partial<ChatParticipantDto> = {};
      if (model.type === ChatType.GROUP && chat.type === ChatType.GROUP) {
        if (chat.type === ChatType.GROUP && participant?.dataValues.isAdmin) {
          switch (model.action) {
            case GroupActionStatus.REMOVED:
              updatePayload.removeGroup = true;
              updatePayload.isActive = false;
              updatePayload.updatedBy = this.currentUserGuid;
              break;

            case MessagePermission.ADMIN:
              updatePayload.isAdminMsg = true;
              updatePayload.updatedBy = this.currentUserGuid;
              break;

            case GroupActionStatus.LEAVE:
              updatePayload.leaveGroup = true;
              updatePayload.updatedBy = this.currentUserGuid;
              break;
            case ChatAction.MUTE:
              updatePayload.isMuted = true;
              updatePayload.updatedBy = this.currentUserGuid;
              break;
            case ChatAction.ARCHIVE:
              updatePayload.isArchived = true;
              updatePayload.updatedBy = this.currentUserGuid;
              break;
          }
        } else {
          switch (model.action) {
            case GroupActionStatus.LEAVE:
              updatePayload.leaveGroup = true;
              updatePayload.updatedBy = this.currentUserGuid;
              break;
            case ChatAction.MUTE:
              updatePayload.isMuted = true;
              updatePayload.updatedBy = this.currentUserGuid;
              break;
            case ChatAction.ARCHIVE:
              updatePayload.isArchived = true;
              updatePayload.updatedBy = this.currentUserGuid;
              break;
          }
        }
      } else if (
        model.type === ChatType.PRIVATE &&
        chat.type === ChatType.PRIVATE
      ) {
        switch (model.action) {
          case ChatAction.BLOCK:
            if (
              participant?.dataValues.id != this.currentUserId &&
              isCurrentUserParticipant
            ) {
              updatePayload.isBlocked = true;
              updatePayload.blockedBy = this.currentUserId;
              updatePayload.updatedBy = this.currentUserGuid;
            }
            break;
          case ChatAction.MUTE:
            updatePayload.isMuted = true;
            updatePayload.updatedBy = this.currentUserGuid;
            break;
          case ChatAction.ARCHIVE:
            updatePayload.isArchived = true;
            updatePayload.updatedBy = this.currentUserGuid;
            break;
        }
      }

      const status = await participant?.update(updatePayload, {
        where: {
          chatId: model.chatId,
          userId: user.id,
          isActive: true,
          isDeleted: false,
          isBlocked: false,
        },
        raw: true,
      });

      if (!status) {
        return {
          success: false,
          status: 400,
          message: "Some error occurred while updating the action",
        };
      }

      const response = updatePayload as ChatParticipantDto;

      if (response) {
        return {
          success: true,
          status: 200,
          message: "Chat created successfully!",
          data: response,
        };
      } else {
        return {
          success: false,
          status: 400,
          message: "Some error occurred while updating the action",
        };
      }
    } catch (error) {
      logError({
        error: error,
        errorType: "DATABASE_ERROR",
      });

      return {
        success: false,
        status: 400,
        message: "Some error occurred while creating chat action",
      };
    }
  }
}
