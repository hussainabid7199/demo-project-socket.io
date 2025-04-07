import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { Server as SocketIOServer } from "socket.io";
import Response from "../dtos/Response";
import IUserService from "./interface/IUserService";
import { UserBasicDto } from "../dtos/UserDto";
import UserModel from "../database/models/UserModel";

@injectable()
export default class UserService implements IUserService {
  constructor(@inject(TYPES.SocketIO) private io: SocketIOServer) {}

  async get(): Promise<Response<UserBasicDto[]>> {
    const users = await UserModel.findAll({
      where: { isActive: true, isDeleted: false },
      attributes: [
        "id",
        "guid",
        "firstName",
        "lastName",
        "email",
        "profilePicture",
        "isActive",
        "isDeleted",
      ],
    });

    const response: UserBasicDto[] = users.map((x) => {
      const user: UserBasicDto = x.dataValues;
      return {
        id: user.id,
        guid: user.guid,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
        isActive: user.isActive,
        isDeleted: user.isDeleted,
      };
    });

    if (response) {
      return {
        success: true,
        data: response,
      };
    } else {
      return {
        success: false,
        message: "Message failed",
        data: [],
      };
    }
  }

  async getById(id: number): Promise<Response<UserBasicDto>> {
    const user = await UserModel.findOne({
      where: { id: id, isActive: true, isDeleted: false },
      attributes: [
        "id",
        "guid",
        "firstName",
        "lastName",
        "email",
        "profilePicture",
        "isActive",
        "isDeleted",
      ],
    });

    const response: UserBasicDto = user?.dataValues;
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

  async getByGuid(id: number, guid: string): Promise<Response<UserBasicDto>> {
    const user = await UserModel.findOne({
      where: { id: id, guid: guid, isActive: true, isDeleted: false },
      attributes: [
        "id",
        "guid",
        "firstName",
        "lastName",
        "email",
        "profilePicture",
        "isActive",
        "isDeleted",
      ],
    });

    const response: UserBasicDto = user?.dataValues;
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
}
