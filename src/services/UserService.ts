import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import Response from "../dtos/Response";
import IUserService from "./interface/IUserService";
import { UserBasicDto } from "../dtos/UserDto";
import UserModel from "../database/models/UserModel";
import CustomError from "../exceptions/custom-error";
import { SocketServer } from "../socket";

@injectable()
export default class UserService implements IUserService {
  constructor(@inject(TYPES.SocketServer) private io: SocketServer) {}

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
      raw: true
    }) as UserBasicDto | null;

    if(!user)
      if (!user) throw new CustomError("User not found!", 400);

    const response: UserBasicDto = user;
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
