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
import ChatDto from "../dtos/ChatDto";
import { authentication } from "../middleware/authentication.middleware";
import sequelize from "../database/connection";
import IUserService from "../services/interface/IUserService";
import IMiscellaneousService from "../services/interface/IMiscellaneousService";
import { CurrentUserDto } from "../dtos/UserDto";
import { validateSchema } from "../middleware/validation.middleware";
import IGroupService from "../services/interface/IGroupService";
import { GroupInviteDataModel } from "../models/GroupDataModel";
import GroupInviteSchema from "../schema/GroupInviteSchema";
import { errorMessage } from "../utils/error-logging";

@controller("/group")
export class GroupController implements interfaces.Controller {
  private readonly groupService: IGroupService;
  private readonly userService: IUserService;
  private readonly miscellaneousService: IMiscellaneousService;
  private readonly currentUser: CurrentUserDto;
  private readonly currentUserId: number;
  private readonly currentUserGuid: string;

  constructor(
    @inject(TYPES.IGroupService) groupService: IGroupService,
    @inject(TYPES.IUserService) userService: IUserService,
    @inject(TYPES.IMiscellaneousService)
    miscellaneousService: IMiscellaneousService
  ) {
    this.groupService = groupService;
    this.userService = userService;
    this.miscellaneousService = miscellaneousService;
    this.currentUser = this.miscellaneousService.currentUser();
    this.currentUserId = this.currentUser.id;
    this.currentUserGuid = this.currentUser.guid;
  }
  

  @httpPost("/invite", authentication, validateSchema(GroupInviteSchema))
  public async invite(
    @request() req: Request,
    @response() res: Response
  ): Promise<Response<ChatDto | void>> {
    const t = await sequelize.transaction();
    try {
      const model: GroupInviteDataModel = req.body;

      const response = await this.groupService.inviteGroupParticipant(model);

      if (response && response.data && response.success) {
        await t.commit();
        return res.status(200).json(response);
      } else {
        await t.rollback();
        return res.status(400).json(response);
      }
    } catch (ex) {
      await t.rollback();
      const { message } = errorMessage(ex);
      return res.status(500).json({
        success: false,
        message: message || "Internal server error",
        error: "Internal server error",
      });
    }
  }
}
