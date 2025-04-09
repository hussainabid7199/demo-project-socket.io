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
import { authentication } from "../middleware/authentication.middleware";
import IUserService from "../services/interface/IUserService";
import {
  GroupDataModel,
  GroupParticipantDataModel,
} from "../models/GroupDataModel";
import IGroupService from "../services/interface/IGroupService";
import { GroupDto, GroupMemberDto } from "../dtos/GroupDto";
import IMiscellaneousService from "../services/interface/IMiscellaneousService";
import { CurrentUserDto } from "../dtos/UserDto";

@controller("/group")
export class GroupController implements interfaces.Controller {
  private readonly chatService: IChatService;
  private readonly userService: IUserService;
  private readonly groupService: IGroupService;
  private readonly miscellaneousService: IMiscellaneousService;
  private readonly currentUser: CurrentUserDto;
  private readonly currentUserId: number;
  private readonly currentUserGuid: string;

  constructor(
    @inject(TYPES.IChatService) chatService: IChatService,
    @inject(TYPES.IUserService) userService: IUserService,
    @inject(TYPES.IGroupService) groupService: IGroupService,
    @inject(TYPES.IMiscellaneousService) miscellaneousService: IMiscellaneousService
  ) {
    this.chatService = chatService;
    this.userService = userService;
    this.groupService = groupService;
    this.miscellaneousService = miscellaneousService;
    this.currentUser = this.miscellaneousService.currentUser();
    this.currentUserId = this.currentUser.id;
    this.currentUserGuid = this.currentUser.guid;
    
  }

  @httpPost("/create", authentication)
  public async createGroup(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<GroupDto>> {
    try {
      const model: GroupDataModel = req.body;

      if (!this.currentUserId || !model.name) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const response = await this.groupService.createGroup(
        model.name
      );

      if (response && response.data && response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (error) {
      console.error("Error while creating group:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  }

  @httpPost("/member", authentication)
  public async addGroupMember(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<GroupMemberDto>> {
    try {
      const model: GroupParticipantDataModel = req.body;

      if (!model.groupId || !model.memberId || !this.currentUserId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const response = await this.groupService.addGroupParticipant(
        model.groupId,
        model.memberId
      );

      if (response && response.data && response.success) {
        return res.status(200).json(response);
      } else {
        return res.status(400).json(response);
      }
    } catch (error) {
      console.error("Error while creating group:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  }
}
