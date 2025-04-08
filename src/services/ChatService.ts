import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import IChatService from "./interface/IChatService";
import { Server as SocketIOServer } from "socket.io";
import Response from "../dtos/Response";
import ChatUserListDto, { ChatContactDto } from "../dtos/ChatDto";
import IUserService from "./interface/IUserService";
import ChatContactModel from "../database/models/ChatContactModel";
import { ChatContactDataModel } from "../models/ChatDataModel";
import { UserBasicDto } from "../dtos/UserDto";
import { ChatAction } from "../enums/chat.action.enum";
import UserModel from "../database/models/UserModel";

@injectable()
export default class ChatService implements IChatService {
  private readonly _userService: IUserService;

  constructor(
    @inject(TYPES.SocketIO) private io: SocketIOServer,
    @inject(TYPES.IUserService)
    userService: IUserService
  ) {
    this._userService = userService;
  }

  // Max response time 25ms Min response time 19ms
  async getChatContact(
    id: number
  ): Promise<Response<ChatUserListDto[]>> {
    const result = (await ChatContactModel.findAll({
      where: {
        currentUserId: id,
        isActive: true,
        isDeleted: false,
      },
      include: [
        {
          model: UserModel,
          as: "user",
          attributes: ["id", "guid", "firstName", "lastName"],
        }, 
      ],
    }));

    const response: ChatUserListDto[] = result.map(({ dataValues: { user } }) => ({
      id: user.id,
      guid: user.guid,
      firstName: user.firstName,
      lastName: user.lastName,
    }));

    if (response) {
      return {
        success: true,
        status: 200,
        message: "Chat contact listed successfully.",
        data: response,
      };
    } else {
      return {
        success: false,
        status: 400,
        message: "Failed to fetch chat contact list.",
      };
    }
  }

  async createChat(
    userId: number,
    currentUserId: number
  ): Promise<Response<ChatContactDto>> {
    const [existingUserResult, currentUserResult] = await Promise.all([
      this._userService.getById(userId),
      this._userService.getById(currentUserId),
    ]);

    const existingUser = existingUserResult.data;
    const currentUserExist = currentUserResult.data;

    if (!existingUser || !currentUserExist) {
      return {
        success: false,
        status: 400,
        message: "Some error occurred while creating chat",
      };
    }

    const user: UserBasicDto = existingUser;
    const currentUser: UserBasicDto = currentUserExist;

    const isChatAvailable = await ChatContactModel.findOne({
      where: {
        userId: user.id,
        currentUserId: currentUser.id,
        isActive: true,
        isDeleted: false,
      },
    });

    if (isChatAvailable) {
      return {
        success: false,
        status: 400,
        message: "Chat already exist.",
      };
    }

    const model: ChatContactDataModel = {
      userId: user.id || 0,
      currentUserId: currentUserId,
      isArchived: false,
      isBlocked: false,
      isMuted: false,
      createdBy: currentUser.guid,
    };

    const { ...dbModel } = model;

    const response = (await ChatContactModel.create(dbModel)).dataValues;

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
  }

  async chatAction(
    userId: number,
    currentUserId: number,
    action: string
  ): Promise<Response<ChatContactDto>> {
    const [existingUserResult, currentUserResult] = await Promise.all([
      this._userService.getById(userId),
      this._userService.getById(currentUserId),
    ]);

    const existingUser = existingUserResult.data;
    const currentUserExist = currentUserResult.data;

    if (!existingUser || !currentUserExist) {
      return {
        success: false,
        status: 400,
        message: "Some error occurred while creating chat",
      };
    }

    const user: UserBasicDto = existingUser;
    const currentUser: UserBasicDto = currentUserExist;
    const updatePayload: Partial<ChatContactDto> = {};
    const isChatAvailable: ChatContactDto = (
      await ChatContactModel.findOne({
        where: {
          userId: user.id,
          currentUserId: currentUser.id,
          isActive: true,
          isDeleted: false,
        },
      })
    )?.dataValues;

    if (!isChatAvailable) {
      return {
        success: false,
        status: 400,
        message: "Chat don't exist",
      };
    }

    switch (action) {
      case ChatAction.BLOCK:
        if (isChatAvailable.isBlocked) {
          return {
            success: false,
            status: 400,
            message: "Already blocked",
          };
        } else {
          updatePayload.isBlocked = true;
          isChatAvailable.isBlocked = true;
        }
        break;

      case ChatAction.MUTE:
        if (isChatAvailable.isMuted) {
          return {
            success: false,
            status: 400,
            message: "Already muted",
          };
        } else {
          updatePayload.isMuted = true;
          isChatAvailable.isMuted = true;
        }
        break;

      case ChatAction.ARCHIVE:
        if (isChatAvailable.isArchived) {
          return {
            success: false,
            status: 400,
            message: "Already archived",
          };
        } else {
          updatePayload.isArchived = true;
          isChatAvailable.isArchived = true;
        }
        break;
    }

    const response = await ChatContactModel.update(updatePayload, {
      where: {
        id: isChatAvailable.id,
      },
    });

    if (response) {
      return {
        success: true,
        status: 200,
        message: "Chat created successfully!",
        data: isChatAvailable,
      };
    } else {
      return {
        success: false,
        status: 400,
        message: "Failed to create chat.",
      };
    }
  }
}
