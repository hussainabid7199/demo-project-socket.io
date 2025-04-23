import { injectable } from "inversify";
import IAccountService from "./interface/IAccountService";
import UserDto, { CurrentUserDto } from "../dtos/UserDto";
import LoginDataModel from "../models/LoginDataModel";
import UserModel from "../database/models/UserModel";
import Response from "../dtos/Response";
import BcryptUtils from "../utils/bcrypt.utils";
import generateToken from "../jwt/jwt-token";
import logError, { extractErrorMessage } from "../utils/error-logging";


@injectable()
export default class AccountService implements IAccountService {
  async login(model: LoginDataModel): Promise<Response<UserDto>> {
    try {
      if (!model.username && !model.password) {
        throw new Error("Login credentials required");
      }

      const result = await UserModel.findOne({
        where: {
          email: model.username,
          isActive: true,
          isDeleted: false,
        },
        attributes: [
          "id",
          "guid",
          "email",
          "firstName",
          "lastName",
          "profilePicture",
          "password",
          "isActive",
          "isDeleted",
        ],
        raw: false,
      });

      const userResponse = result?.dataValues;
      if (!userResponse) {
        throw new Error("Invalid username or password");
      }

      const isPasswordValid = await BcryptUtils.comparePassword(
        model.password,
        userResponse.password
      );

      if (!isPasswordValid) {
        throw new Error("Invalid username or password");
      }

      const fullName = `${userResponse.firstName} ${userResponse.lastName}`;
      const currentUser: CurrentUserDto = {
        id: userResponse.id,
        guid: userResponse.guid,
        email: userResponse.email,
        fullName: fullName
      }

      const token = await generateToken(currentUser);

      if (!token) {
        throw new Error("Some error occurred");
      }

      const usersData: UserDto = userResponse;

      const response: UserDto = {
        id: usersData.id,
        guid: usersData.guid,
        firstName: usersData.firstName,
        lastName: usersData.lastName,
        email: usersData.email,
        profilePicture: usersData.profilePicture,
        isActive: usersData.isActive,
        isDeleted: usersData.isDeleted,
        token: token,
      };

      if (response) {
        return {
          success: true,
          status: 200,
          message: "Login successful!",
          data: response,
        };
      } else {
        return {
          success: false,
          message: "Login failed",
        };
      }
    } catch (error) {
      logError({
        error: extractErrorMessage(error),
        errorType: "DATABASE_ERROR",
        errorCode: "DB001",
      });

      return {
        success: false,
        status: 400,
        message: "Some error occurred while login",
      };
    }
  }
}
