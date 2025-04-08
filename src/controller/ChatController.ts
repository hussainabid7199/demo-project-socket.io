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
import ChatDto from "../dtos/ChatDto";
import { authentication } from "../middleware/authentication.middleware";
import sequelize from "../database/connection";
import IUserService from "../services/interface/IUserService";
import ChatUserListDto from "../dtos/ChatDto";

@controller("/chat")
export class ChatController implements interfaces.Controller {
  private readonly _chatService: IChatService;
  private readonly _userService: IUserService;

  constructor(
    @inject(TYPES.IChatService) chatService: IChatService,
    @inject(TYPES.IUserService) userService: IUserService
  ) {
    this._chatService = chatService;
    this._userService = userService;
  }

  @httpGet("/contact/:id/:guid", authentication)
  public async contact(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ChatUserListDto | void>> {
    try {
      const { id, guid } = req.params;

      if (!+id || !guid) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const userExist = await this._userService.getByGuid(+id, guid);

      if (!userExist) {
        return res
          .status(400)
          .json({ success: false, message: "User does not exist" });
      }

      const response = await this._chatService.getChatContact(
        userExist.data?.id || 0
      );

      if (response && response.data && response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (error) {
      console.error("Error while fetching contact:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  }

  @httpPost("/create", authentication)
  public async createChat(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ChatDto | void>> {
    const t = await sequelize.transaction();
    try {
      const { userId, currentUserId } = req.body;

      if (!userId || !currentUserId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const response = await this._chatService.createChat(
        userId,
        currentUserId
      );

      if (response && response.data && response.success) {
        await t.commit();
        return res.status(200).json(response);
      } else {
        await t.rollback();
        return res.status(400).json(response);
      }
    } catch (error) {
      await t.rollback();
      console.error("Error while creating chat:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  }

  @httpPost("/action", authentication)
  public async chatAction(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ChatDto | void>> {
    const t = await sequelize.transaction();
    try {
      const { userId, currentUserId, action } = req.body;

      if (!userId || !currentUserId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const response = await this._chatService.chatAction(
        userId,
        currentUserId,
        action
      );

      if (response && response.data && response.success) {
        await t.commit();
        return res.status(200).json(response);
      } else {
        await t.rollback();
        return res.status(400).json(response);
      }
    } catch (error) {
      await t.rollback();
      console.error("Error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  }
}
