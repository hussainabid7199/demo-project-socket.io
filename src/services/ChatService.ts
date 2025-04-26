import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import Response from "../dtos/Response";
import UserModel from "../database/models/UserModel";
import { SocketServer } from "../socket";
import IChatService from "./interface/IChatService";
import { ChatDto } from "../dtos/ChatDto";
import ChatModel from "../database/models/ChatModel";
import { ChatDataModel } from "../models/ChatDataModel";
import IMiscellaneousService from "./interface/IMiscellaneousService";
import UserDto, { CurrentUserDto } from "../dtos/UserDto";
import ChatParticipantModel from "../database/models/ChatParticipantModel";
import { CreationAttributes } from "sequelize";
import sequelize from "../database/connection";
import { generateHashed } from "../utils/random-id-generator";

@injectable()
export default class ChatService implements IChatService {
  private readonly miscellaneousService: IMiscellaneousService;
  private readonly currentUser: CurrentUserDto;
  private readonly currentUserId: string;
  constructor(
    @inject(TYPES.SocketServer) private io: SocketServer,
    @inject(TYPES.IMiscellaneousService)
    miscellaneousService: IMiscellaneousService
  ) {
    this.miscellaneousService = miscellaneousService;
    this.currentUser = this.miscellaneousService.currentUser();
    this.currentUserId = this.currentUser.id;
  }

  async get(): Promise<Response<ChatDto[]>> {
    const chat = await ChatModel.findAll({
      where: { isActive: true, isDeleted: false },
    });

    const response: ChatDto[] = chat.map((x) => {
      const chat: ChatDto = x.dataValues;
      return {
        id: chat.id,
        type: chat.type,
        name: chat.name,
        avatarUrl: chat.avatarUrl,
        createdAt: chat.createdAt,
        isActive: chat.isActive,
        isDeleted: chat.isDeleted,
      };
    });

    if (response) {
      return {
        success: true,
        status: 200,
        data: response,
      };
    } else {
      return {
        success: false,
        status: 400,
        message: "User not found",
        data: [],
      };
    }
  }

  async getById(id: string): Promise<Response<ChatDto>> {
    const user = await UserModel.findOne({
      where: { id: id, isActive: true, isDeleted: false },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "profilePicture",
        "isActive",
        "isDeleted",
      ],
    });

    const response: ChatDto = user?.dataValues;
    if (response) {
      return {
        success: true,
        data: response,
      };
    } else {
      return {
        success: false,
        message: "Message failed",
      };
    }
  }

  async add(id: string, model: ChatDataModel): Promise<Response<ChatDto>> {
    const t = await sequelize.transaction();
    try {
      model.createdBy = this.currentUserId;
      model.updatedBy = this.currentUserId;

      const selectUser = (await UserModel.findOne({
        where: { id: id },
        raw: true,
      })) as UserDto | null;

      if (!selectUser) {
        throw new Error("User not found.");
      }

      model.name = await generateHashed(this.currentUserId, selectUser.id);

      const { ...dbModel } = model;
      const response: ChatDto = (await ChatModel.create(dbModel)).dataValues;

      type ChatParticipantDataModel = CreationAttributes<ChatParticipantModel>;

      const participants: ChatParticipantDataModel[] = [
        {
          chatId: response.id,
          userId: this.currentUserId,
          isAdmin: false,
          isMuted: false,
          isArchived: false,
          isBlocked: false,
          createdBy: this.currentUserId,
          updatedBy: this.currentUserId,
          isActive: true,
          isDeleted: false,
        },
        {
          chatId: response.id,
          userId: selectUser.id,
          isAdmin: false,
          isMuted: false,
          isArchived: false,
          isBlocked: false,
          createdBy: this.currentUserId,
          updatedBy: this.currentUserId,
          isActive: true,
          isDeleted: false,
        },
      ];

      const chatParticipants = await ChatParticipantModel.bulkCreate(
        participants,
        {
          returning: true,
        }
      );

      if (!chatParticipants) {
        await t.rollback();
        return {
          success: false,
          status: 400,
          message: "Some error occurred while creating chat participants",
        };
      }

      if (response) {
        await t.commit();
        return {
          success: true,
          status: 200,
          data: response,
        };
      } else {
        await t.rollback();
        return {
          success: false,
          status: 400,
          message: "Chat not found",
        };
      }
    } catch (error) {
      await t.rollback();
      console.log(error);
      return {
        success: false,
        message: "Some error occurred!",
      };
    }
  }
}
