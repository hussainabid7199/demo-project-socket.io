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
import sequelize from "../database/connection";
import IUserService from "../services/interface/IUserService";
import {
  GroupDataModel,
  GroupParticipantDataModel,
} from "../models/GroupDataModel";
import IGroupService from "../services/interface/IGroupService";
import { GroupDto, GroupMemberDto } from "../dtos/GroupDto";

@controller("/group")
export class GroupController implements interfaces.Controller {
  private readonly _chatService: IChatService;
  private readonly _userService: IUserService;
  private readonly _groupService: IGroupService;

  constructor(
    @inject(TYPES.IChatService) chatService: IChatService,
    @inject(TYPES.IUserService) userService: IUserService,
    @inject(TYPES.IGroupService) groupService: IGroupService
  ) {
    this._chatService = chatService;
    this._userService = userService;
    this._groupService = groupService;
  }

  @httpPost("/create", authentication)
  public async createGroup(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<GroupDto>> {
    const t = await sequelize.transaction();
    try {
      const model: GroupDataModel = req.body;

      if (!model.adminId || !model.name) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const response = await this._groupService.createGroup(
        model.adminId,
        model.name
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
    const t = await sequelize.transaction();
    try {
      const model: GroupParticipantDataModel = req.body;

      if (!model.groupId || !model.memberId || !model.currentUserId) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request payload" });
      }

      const response = await this._groupService.addGroupParticipant(
        model.groupId,
        model.memberId,
        model.currentUserId
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
      console.error("Error while creating group:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "Internal server error",
      });
    }
  }
}
