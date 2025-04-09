"use-strict";
import { Request, Response } from "express";
import { inject } from "inversify";
import {
  controller,
  httpGet,
  httpPost,
  interfaces,
  request,
  response,
} from "inversify-express-utils";
import { TYPES } from "../config/types";
import IAccountService from "../services/interface/IAccountService";
import LoginModel from "../models/LoginDataModel";
import UserDto from "../dtos/UserDto";
import sequelize from "../database/connection";
import { UserDataModel } from "../models/UserDataModel";
import BcryptUtils from "../utils/bcrypt.utils";
import UserModel from "../database/models/UserModel";

@controller("/account")
export class AccountController implements interfaces.Controller {
  private readonly _accountService: IAccountService;

  constructor(@inject(TYPES.IAccountService) accountService: IAccountService) {
    this._accountService = accountService;
  }

  @httpGet("/health")
  public async account(
    @request() req: Request,
    @response() res: Response
  ): Promise<void> {
    res.status(200).send({
      success: true,
      message: "Health OK!",
      data: "Health OK!",
    });
  }

  @httpPost("/login")
  public async login(
    @request() req: Request,
    @response() res: Response
  ): Promise<UserDto | void> {
    const model: LoginModel = req.body;
    const t = await sequelize.transaction();
    try {
      const response = await this._accountService.login(model);
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
    } catch (error) {
      await t.rollback();
      console.log(error);
      res.status(400).send({
        message: "Invalid username or password",
        error: "Invalid username or password",
      });
    }
  }

  @httpPost("/register")
  public async register(
    @request() req: Request,
    @response() res: Response
  ): Promise<UserDto | void> {
    const t = await sequelize.transaction();
    try {
      const model = req.body as UserDataModel;
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
      const response = await UserModel.create(dbModel);

      await t.commit();
      res.status(201).json(response);
    } catch (error) {
      await t.rollback();
      res.status(400).json({
        success: false,
        message: "Some error occurred!",
        error: error,
      });
    }
  }
}
