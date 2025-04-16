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
import IUserService from "../services/interface/IUserService";
import IMiscellaneousService from "../services/interface/IMiscellaneousService";
import { CurrentUserDto } from "../dtos/UserDto";
import IMessageService from "../services/interface/IMessageService";

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

  @httpPost("/send", authentication)
  public async send(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ChatDto | void>> {
    try {
      const { userId, message } = req.body;

      if (!userId || !message || !this.currentUserId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const chatExistResponse = await this.chatService.chatExist(userId);

      if (chatExistResponse && chatExistResponse.status != 200) {
        return res.status(400).json({
          success: false,
          message: "Chat don't exist, please create a new chat.",
        });
      }

      const chatId: number = chatExistResponse.data?.chatId || 0;
      let receiverId: number = 0;
      if (chatExistResponse.data?.chatCurrentUserId != this.currentUserId) {
        receiverId = chatExistResponse.data?.chatCurrentUserId || 0;
      }

      if (chatExistResponse.data?.chatPassedUserId != this.currentUserId) {
        receiverId = chatExistResponse.data?.chatPassedUserId || 0;
      }

      const response = await this.messageService.sendMessage(
        chatId,
        receiverId,
        message
      );

      if (response && response.data && response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (error) {
      console.error("Error while creating chat:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  }

  @httpGet("/:userId", authentication)
  public async messages(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ChatDto | void>> {
    try {
      const userId = +req.params.userId;

      if (!userId || !this.currentUserId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const response = await this.messageService.getAllMessages(userId);

      if (response && response.data && response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
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
}
