"use-strict";
import { Request, Response } from "express";
import { inject } from "inversify";
import {
  controller,
  httpGet,
  interfaces,
  request,
  response,
} from "inversify-express-utils";
import { TYPES } from "../config/types";
import { UserBasicDto } from "../dtos/UserDto";
import IUserService from "../services/interface/IUserService";
import { authentication } from "../middleware/authentication.middleware";
import { errorMessage } from "../utils/error-logging";

@controller("/user")
export class UserController implements interfaces.Controller {
  private readonly userService: IUserService;

  constructor(@inject(TYPES.IUserService) userService: IUserService) {
    this.userService = userService;
  }

  @httpGet("/", authentication)
  public async get(
    @request() req: Request,
    @response() res: Response
  ): Promise<UserBasicDto[] | void> {
    try {
      const response = await this.userService.get();
      if (response && response.data && response.status) {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } catch (ex) {
      const { message, errorCode} = errorMessage(ex);
      res.status(400).send({
        message: message || "Some error occurred while fetching users",
        error: errorCode
      });
    }
  }

  @httpGet("/:id", authentication)
  public async getById(
    @request() req: Request,
    @response() res: Response
  ): Promise<UserBasicDto | void> {
    try {
      const id = +req.params.id;
      const response = await this.userService.getById(id);
      if (response && response.data && response.success) {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } catch (ex) {
      const { message, errorCode} = errorMessage(ex);
      res.status(400).send({
        message: message || "Some error occurred while fetching user",
        error: errorCode
      });
    }
  }

  @httpGet("/:id/:guid", authentication)
  public async getByGuid(
    @request() req: Request,
    @response() res: Response
  ): Promise<UserBasicDto | void> {
    try {
      const id = +req.params.id;
      const guid = req.params.guid;
      const response = await this.userService.getByGuid(id, guid);
      if (response && response.data && response.success) {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } catch (ex) {
      const { message, errorCode} = errorMessage(ex);
      res.status(400).send({
        message: message || "Some error occurred while fetching user",
        error: errorCode
      });
    }
  }
}
