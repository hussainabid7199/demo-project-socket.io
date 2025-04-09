import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { Server as SocketIOServer } from "socket.io";
import Response from "../dtos/Response";
import IGroupService from "./interface/IGroupService";
import UserModel from "../database/models/UserModel";
import CustomError from "../exceptions/custom-error";
import GroupModel from "../database/models/GroupModel";
import { GroupDataModel, GroupMemberDataModel } from "../models/GroupDataModel";
import { GroupDto, GroupMemberDto } from "../dtos/GroupDto";
import GroupMemberModel from "../database/models/GroupMemberModel";
import UnauthorizedError from "../exceptions/unauthorized-error";
import IMiscellaneousService from "./interface/IMiscellaneousService";
import { CurrentUserDto, UserBasicDto } from "../dtos/UserDto";
import sequelize from "../database/connection";

@injectable()
export default class GroupService implements IGroupService {
  private readonly miscellaneousService: IMiscellaneousService;
  private readonly currentUser: CurrentUserDto;
  private readonly currentUserGuid: string;

  constructor(
    @inject(TYPES.SocketIO) private io: SocketIOServer,
    @inject(TYPES.IMiscellaneousService)
    miscellaneousService: IMiscellaneousService
  ) {
    this.miscellaneousService = miscellaneousService;
    this.currentUser = this.miscellaneousService.currentUser();
    this.currentUserGuid = this.currentUser.guid;
  }

  async createGroup(name: string): Promise<Response<GroupDto>> {
    const t = await sequelize.transaction();
    try {
      const userExist = await UserModel.findOne({
        where: { guid: this.currentUserGuid },
      });

      if (!userExist) throw new CustomError("User not found!", 400);

      const groupModel: GroupDataModel = {
        adminId: this.currentUserGuid,
        name: name,
        createdBy: this.currentUserGuid,
        isActive: true,
        isDeleted: false,
      };

      const { ...groupDbModel } = groupModel;
      const group: GroupDto = (await GroupModel.create(groupDbModel))
        .dataValues;

      if (!group)
        throw new CustomError("Some error occurred while creating group.", 400);

      const groupMemberModel: GroupMemberDataModel = {
        groupId: group.id,
        memberId: group.adminId,
        createdBy: group.createdBy,
        isAdmin: true,
        isActive: true,
        isDeleted: false,
      };

      const { ...groupMemberDbModel } = groupMemberModel;
      const groupMember = (await GroupMemberModel.create(groupMemberDbModel))
        .dataValues;

      if (!groupMember)
        throw new CustomError("Some error occurred while creating group.", 400);

      const response: GroupDto = group;

      if (response) {
        await t.commit();
        return {
          success: true,
          data: response,
        };
      } else {
        await t.rollback();
        return {
          success: false,
          message: "Message failed",
        };
      }
    } catch (error) {
      await t.rollback();
      console.error("Error while creating group:", error);
      return {
        success: false,
        message: `Error while creating group: ${error}`,
      };
    }
  }

  async addGroupParticipant(
    groupId: number,
    memberId: string
  ): Promise<Response<GroupMemberDto>> {
    const t = await sequelize.transaction();
    try {
      const group = (await GroupModel.findOne({
        where: { id: groupId },
        raw: true,
      })) as GroupDto | null;

      if (!group) throw new CustomError("Group not found!", 400);

      const member = (await UserModel.findOne({
        where: { guid: memberId },
        attributes: ["id", "guid", "firstName", "lastName", "email"],
        raw: true,
      })) as UserBasicDto | null;

      if (!member) throw new CustomError("User not found!", 400);

      const isCurrentUserGroupMember = await GroupMemberModel.findOne({
        where: {
          groupId: group.id,
          memberId: this.currentUserGuid,
          isAdmin: true,
          isActive: true,
          isDeleted: false,
        },
      });

      if (!isCurrentUserGroupMember)
        throw new UnauthorizedError("Unauthorized to add member");

      const isMemberExistInGroup = await GroupMemberModel.findOne({
        where: {
          groupId: group.id,
          memberId: member.guid,
          isActive: true,
          isDeleted: false,
        },
      });

      if (isMemberExistInGroup)
        throw new CustomError("Already added to group", 400);

      const model: GroupMemberDataModel = {
        groupId: group.id,
        memberId: member.guid,
        createdBy: this.currentUserGuid,
        isAdmin: false,
        isActive: true,
        isDeleted: false,
      };

      const { ...dbModel } = model;
      const response = (await GroupMemberModel.create(dbModel)).dataValues;

      if (response) {
        await t.commit();
        return {
          success: true,
          data: response,
        };
      } else {
        await t.rollback();
        return {
          success: false,
          message: "Some error",
        };
      }
    } catch (error) {
      await t.rollback();
      console.error("Error while adding member:", error);
      return {
        success: false,
        message: `Error while adding member: ${error}`,
      };
    }
  }
}
