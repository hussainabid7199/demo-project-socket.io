import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import IChatService from "./interface/IChatService";
import Response from "../dtos/Response";
import ChatDto from "../dtos/ChatDto";
import IUserService from "./interface/IUserService";
import {
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
    const chatExist = await ChatModel.findOne({
      where: {
        roomId: roomId,
        isActive: true,
        isDeleted: false,
      },
      raw: true,
    });

    const model: ChatContactDataModel = {
      roomId: roomId,
      type: ChatType.PRIVATE,
      createdBy: this.currentUserGuid,
    };

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
  }

  async groupChat(
    name: string,
    description: string,
    participant: number[]
  ): Promise<Response<ChatDto>> {
    const groupUniqueId = await generateUniqueId();

    const model: ChatContactDataModel = {
      roomId: groupUniqueId,
      type: ChatType.GROUP,
      name: name,
      description: description,
      createdBy: this.currentUserGuid,
    };

    const { ...dbModel } = model;

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
    if (participant && participant.length > 0) {
      const model: ChatParticipantDataModel[] = [];
      const currentParticipant: ChatParticipantDataModel[] = participant.map(
        (x) => {
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
        }
      );
      model.push(...adminUser, ...currentParticipant);
      groupParticipant = await ChatParticipantModel.bulkCreate(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        model as unknown as Optional<any, string>[]
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
  }

  async chatAction(
    type: string,
    chatId: number,
    userId: number,
    action: string
  ): Promise<Response<ChatDto>> {
    const user = (await UserModel.findOne({
      where: { userId: userId },
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
      where: { chatId: chatId },
      raw: true,
    })) as ChatDto | null;

    if (!chat) {
      return {
        success: false,
        status: 400,
        message: "Chat not found!",
      };
    }

    if (type === ChatType.GROUP) {
      // check is current user admin
      let isCurrentUserAdmin;
      const isAdmin = await ChatParticipantModel.findOne({
        where: {
          chatId: chatId,
          userId: user.id,
          isAdmin: true,
          isActive: true,
          isDeleted: false,
          isBlocked: false,
        },
        raw: true,
      });

      if (isAdmin) isCurrentUserAdmin = true;

      if (isCurrentUserAdmin) {
        switch (action) {
          case GroupActionStatus.REMOVED:
            // Remove the specific group participant
            break;
          case MessagePermission.ADMIN:
            // Control if the user is admin
            break;
        }
      } else {
        switch (action) {
          case GroupActionStatus.LEAVE:
            // Leave group by the current login user
            break;
          case ChatAction.MUTE:
            // Mute the group for current login user
            break;
          case ChatAction.ARCHIVE:
            // Archive the group for current login user
            break;
        }
      }
    } else if (type === ChatType.PRIVATE) {
      switch (action) {
        case ChatAction.BLOCK:
          // Block the other user associated with you in chat.
          break;
        case ChatAction.MUTE:
          // Mute the chat for current login user
          break;
        case ChatAction.ARCHIVE:
          // Archive the chat for current login user
          break;
      }
    }

    throw new Error("Method not implemented.");
  }
}
