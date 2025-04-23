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
import IChatService from "../services/interface/IChatService";
import ChatDto from "../dtos/ChatDto";
import { authentication } from "../middleware/authentication.middleware";
import sequelize from "../database/connection";
import IUserService from "../services/interface/IUserService";
import IMiscellaneousService from "../services/interface/IMiscellaneousService";
import { CurrentUserDto } from "../dtos/UserDto";
import { validateSchema } from "../middleware/validation.middleware";
import ChatActionSchema from "../schema/ChatActionSchema";
import { ChatActionDataModel } from "../models/ChatDataModel";
import { GroupDataModel } from "../models/GroupDataModel";
import GroupSchema from "../schema/GroupSchema";

@controller("/chat")
export class ChatController implements interfaces.Controller {
  private readonly chatService: IChatService;
  private readonly userService: IUserService;
  private readonly miscellaneousService: IMiscellaneousService;
  private readonly currentUser: CurrentUserDto;
  private readonly currentUserId: number;
  private readonly currentUserGuid: string;

  constructor(
    @inject(TYPES.IChatService) chatService: IChatService,
    @inject(TYPES.IUserService) userService: IUserService,
    @inject(TYPES.IMiscellaneousService)
    miscellaneousService: IMiscellaneousService
  ) {
    this.chatService = chatService;
    this.userService = userService;
    this.miscellaneousService = miscellaneousService;
    this.currentUser = this.miscellaneousService.currentUser();
    this.currentUserId = this.currentUser.id;
    this.currentUserGuid = this.currentUser.guid;
  }

  @httpPost("/private", authentication)
  public async oneToOneChat(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ChatDto | void>> {
    const t = await sequelize.transaction()
    try {
      const { userId } = req.body;

      if (!userId || !this.currentUserId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const response = await this.chatService.oneToOneChat(userId);

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

  @httpPost("/group", authentication, validateSchema(GroupSchema))
  public async groupChat(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ChatDto | void>> {
    const t = await sequelize.transaction();
    try {
      const model:GroupDataModel = req.body;

      if (!model.name || !this.currentUserId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const response = await this.chatService.groupChat(model);

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

  @httpPost("/action", authentication, validateSchema(ChatActionSchema))
  public async chatAction(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ChatDto | void>> {
    const t = await sequelize.transaction();
    try {
      const model: ChatActionDataModel = req.body;
      const response = await this.chatService.chatAction(model);

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
