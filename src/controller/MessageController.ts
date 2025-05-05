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
import IChatService from "../services/interface/IChatService";
import { authentication } from "../middleware/authentication.middleware";
import IUserService from "../services/interface/IUserService";
import IMiscellaneousService from "../services/interface/IMiscellaneousService";
import { CurrentUserDto } from "../dtos/UserDto";
import { ContactDto } from "../dtos/ContactDto";
import IMessageService from "../services/interface/IMessageService";
import { validateSchema } from "../middleware/validation.middleware";
import { MessageDataModel } from "../models/MessageDataModel";
import MessageSchema from "../schema/MessageSchema";
import { MessageDto } from "../dtos/MessageDto";
import sequelize from "../database/connection";

@controller("/message")
export class MessageController implements interfaces.Controller {
  private readonly chatService: IChatService;
  private readonly userService: IUserService;
  private readonly messageService: IMessageService;
  private readonly miscellaneousService: IMiscellaneousService;
  private readonly currentUser: CurrentUserDto;
  private readonly currentUserId: number;
  private readonly currentUserGuid: string;

  constructor(
    @inject(TYPES.IChatService) chatService: IChatService,
    @inject(TYPES.IUserService) userService: IUserService,
    @inject(TYPES.IMessageService) messageService: IMessageService,
    @inject(TYPES.IMiscellaneousService)
    miscellaneousService: IMiscellaneousService
  ) {
    this.chatService = chatService;
    this.userService = userService;
    this.messageService = messageService;
    this.miscellaneousService = miscellaneousService;
    this.currentUser = this.miscellaneousService.currentUser();
    this.currentUserId = this.currentUser.id;
    this.currentUserGuid = this.currentUser.guid;
  }

  @httpGet("/:chatId", authentication)
  public async messages(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ContactDto[] | void>> {
    try {
      const { chatId } = req.params;

      if (!+chatId || !this.currentUserId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const response = await this.messageService.message(+chatId);

      if (response && response.data && response.success) {
        return res.status(response.status || 200).json(response);
      } else {
        return res.status(response.status || 400).json(response);
      }
    } catch (error) {
      console.error("Error while fetching the messages:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  }

  @httpPost("/send", authentication, validateSchema(MessageSchema))
  public async sendMessages(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<MessageDto | void>> {
    const t = await sequelize.transaction();
    try {
      const model: MessageDataModel = req.body;
      const response = await this.messageService.sendMessage(model);

      if (response && response.data && response.success) {
        await t.commit();
        return res.status(response.status || 200).json(response);
      } else {
        await t.rollback();
        return res.status(response.status || 400).json(response);
      }
    } catch (error) {
      await t.rollback();
      console.error("Error while fetching the messages:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  }

  @httpPost("/delete", authentication)
  public async deleteMessages(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ContactDto[] | void>> {
    const t = await sequelize.transaction();
    try {
      const { chatId, messageId, action } = req.body;
      const response = await this.messageService.deleteMessage(chatId, messageId, action);

      if (response && response.data && response.success) {
        await t.commit();
        return res.status(response.status || 204).json(response);
      } else {
        await t.rollback();
        return res.status(response.status || 400).json(response);
      }
    } catch (error) {
      await t.rollback();
      console.error("Error while deleting the messages:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  }
}
