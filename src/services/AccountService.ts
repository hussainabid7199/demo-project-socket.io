import { injectable } from "inversify";
import IAccountService from "./interface/IAccountService";
import UserDto from "../dtos/UserDto";
import LoginDataModel from "../models/LoginDataModel";
import UserModel from "../database/models/UserModel";
import sequelize from "../database/connection";
import Response from "../dtos/Response";
import BcryptUtils from "../utils/bcrypt.utils";
import generateToken from "../jwt/jwt-token";

@injectable()
export default class AccountService implements IAccountService {
  async login(model: LoginDataModel): Promise<Response<UserDto>> {
    const t = await sequelize.transaction();
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

      const token = await generateToken(userResponse.email, userResponse.guid);

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
    } catch (e) {
      console.log(e);
      await t.rollback();
      throw new Error("Some error occurred!");
    }
  }

  register(model: UserModel): Promise<UserDto> {
    console.log(model);
    throw new Error("Method not implemented.");
  }
}
