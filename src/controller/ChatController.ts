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
import { UserBasicDto } from "../dtos/UserDto";
import { authentication } from "../middleware/authentication.middleware";
import IChatService from "../services/interface/IChatService";
import { ChatDataModel } from "../models/ChatDataModel";
import { SocketServer } from "../socket";
import { ChatEventEnum } from "../socket/constant";

@controller("/chat")
export class ChatController implements interfaces.Controller {
  private readonly chatService: IChatService;

  constructor(
    @inject(TYPES.SocketServer) private io: SocketServer,
    @inject(TYPES.IChatService) chatService: IChatService
  ) {
    this.chatService = chatService;
  }

  @httpGet("/", authentication)
  public async get(
    @request() req: Request,
    @response() res: Response
  ): Promise<UserBasicDto[] | void> {
    try {
      const response = await this.chatService.get();
      if (response && response.data && response.status) {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } catch (error) {
      res.status(400).send({
        message: "Try again!",
        error: error,
      });
    }
  }

  @httpGet("/:id", authentication)
  public async getById(
    @request() req: Request,
    @response() res: Response
  ): Promise<UserBasicDto | void> {
    try {
      const id = req.params.id;
      const response = await this.chatService.getById(id);
      if (response && response.data && response.success) {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } catch (error) {
      res.status(400).send({
        message: "Try again!",
        error: error,
      });
    }
  }

  @httpPost("/:id/:type", authentication)
  public async addChat(
    @request() req: Request,
    @response() res: Response
  ): Promise<UserBasicDto | void> {
    try {
      const model = req.body as ChatDataModel;
      const selectedUserId: string = req.params.id;
      const type: string = req.params.type;

      model.type = type;

      if (
        !model ||
        !model.type ||
        (model.type.toUpperCase() !== "P" &&
          model.type.toUpperCase() !== "G") ||
        !selectedUserId
      ) {
        res.status(400).send({
          message: "Try again!",
          error: "Invalid model input",
        });
      }

      const response = await this.chatService.add(selectedUserId, model);
      this.io.emitSocketEvent(response?.data?.name || "", ChatEventEnum.NEW_CHAT_EVENT, response.data?.name);
      if (response && response.data && response.success) {
        res.status(200).send(response);
      } else {
        res.status(400).send(response);
      }
    } catch (error) {
      res.status(400).send({
        message: "Try again!",
        error: error,
      });
    }
  }
}
