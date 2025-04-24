import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import Response from "../dtos/Response";
import IUserService from "./interface/IUserService";
import { CurrentUserDto, UserBasicDto } from "../dtos/UserDto";
import UserModel from "../database/models/UserModel";
import CustomError from "../exceptions/custom-error";
import { SocketServer } from "../socket";
import IMiscellaneousService from "./interface/IMiscellaneousService";
import ErrorHandler from "../exceptions/error-handler";

@injectable()
export default class UserService implements IUserService {
  private readonly miscellaneousService: IMiscellaneousService;
  private readonly currentUser: CurrentUserDto;
  private readonly currentUserGuid: string;
  private readonly currentUserId: number;
  constructor(
    @inject(TYPES.SocketServer) private io: SocketServer,
    @inject(TYPES.IMiscellaneousService)
    miscellaneousService: IMiscellaneousService
  ) {
    this.miscellaneousService = miscellaneousService;
    this.currentUser = this.miscellaneousService.currentUser();
    this.currentUserGuid = this.currentUser.guid;
    this.currentUserId = this.currentUser.id;
  }

  async get(): Promise<Response<UserBasicDto[]>> {
    try {
      const users = (
        await UserModel.findAll({
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
        })
      ).filter((e) => e.dataValues.guid != this.currentUserGuid);

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
    } catch (error) {
      return ErrorHandler.Handle(
        error,
        "DATABASE_ERROR",
        400,
        "Some error occurred while fetching users."
      );
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
    try {
      const user = (await UserModel.findOne({
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
        raw: true,
      })) as UserBasicDto | null;

      if (!user) if (!user) throw new CustomError("User not found!", 400);

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
    } catch (error) {
      return ErrorHandler.Handle(
        error,
        "DATABASE_ERROR",
        400,
        "Some error occurred while fetching user."
      );
    }
  }
}
