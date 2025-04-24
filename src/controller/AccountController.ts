"use-strict";
import { Request, Response } from "express";
import { inject } from "inversify";
import {
  controller,
  httpPost,
  interfaces,
  request,
  response,
} from "inversify-express-utils";
import { TYPES } from "../config/types";
import IAccountService from "../services/interface/IAccountService";
import LoginDataModel from "../models/LoginDataModel";
import UserDto, { CurrentUserDto } from "../dtos/UserDto";
import sequelize from "../database/connection";
import { UserDataModel } from "../models/UserDataModel";
import BcryptUtils from "../utils/bcrypt.utils";
import UserModel from "../database/models/UserModel";
import LoginSchema from "../schema/LoginSchema";
import { validateSchema } from "../middleware/validation.middleware";
import pictureUpload from "../utils/multer/picture-upload.utils";
import { errorMessage } from "../utils/error-logging";

@controller("/account")
export class AccountController implements interfaces.Controller {
  private readonly accountService: IAccountService;

  constructor(@inject(TYPES.IAccountService) accountService: IAccountService) {
    this.accountService = accountService;
  }

  @httpPost("/login", validateSchema(LoginSchema))
  public async login(
    @request() req: Request,
    @response() res: Response,
  ): Promise<UserDto | void> {
    const model: LoginDataModel = req.body;
    const t = await sequelize.transaction();
    try {
      const response = await this.accountService.login(model);
      const client_ip = req.clientIp;

      if (response && response.success && response.data) {
        const user = await UserModel.findOne({
          where: { guid: response.data.guid },
        });

        if (user && user.dataValues && client_ip) {
          const loginOn = user?.dataValues.login_on;
          (
            await user.update({
              ip_address: client_ip,  
              login_on: new Date(),
              lastLoginOn: loginOn,
            })
          ).save();
        }
        await t.commit();
        res.status(200).send(response);
      }
    } catch (ex) {
      await t.rollback();
      const { message, error } = errorMessage(ex);
      res.status(400).send({
        message: message || "Invalid username or password",
        error: error || "Invalid username or password",
      });
    }
  }

  @httpPost("/register", pictureUpload)
  public async register(
    @request() req: Request,
    @response() res: Response
  ): Promise<CurrentUserDto | void> {
    const t = await sequelize.transaction();
    try {
      const model = req.body as UserDataModel;
      const files = req.files as Express.Multer.File[];
      const profilePicture = files?.find((f) => f.fieldname === "profilePicture");
      const existingUser = await UserModel.findOne({
        where: { email: model.email },
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: "Username already taken",
        });
        return;
      }

      if (model.password !== model.confirmPassword) {
        res.status(400).json({
          success: false,
          message: "Invalid username or password",
        });
        return;
      }

      model.password = await BcryptUtils.hashPassword(model.password);
      const { ...dbModel } = model;
      const result = await UserModel.create({
        ...dbModel,
        profilePicturePath: profilePicture?.path.toString() ?? null
      });

      const fullName = `${result.dataValues.firstName} ${result.dataValues.lastName}`;
      const response: CurrentUserDto = {
        id: result.dataValues.id,
        guid: result.dataValues.guid,
        email: result.dataValues.email,
        fullName: fullName
      }

      await t.commit();
      res.status(201).json(response);
    } catch (ex) {
      await t.rollback();
      const { message, error } = errorMessage(ex);
      res.status(400).json({
        success: false,
        message: message || "Some error occurred!",
        error: error || "Some error occurred!",
      });
    }
  }
}
