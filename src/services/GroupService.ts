/* eslint-disable @typescript-eslint/no-explicit-any */
import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { Server as SocketIOServer } from "socket.io";
import Response from "../dtos/Response";
import IGroupService from "./interface/IGroupService";
import UserModel from "../database/models/UserModel";
import CustomError from "../exceptions/custom-error";
import GroupModel from "../database/models/GroupModel";
import { GroupDataModel, GroupMemberDataModel } from "../models/GroupDataModel";
import {
  GroupBasicDto,
  GroupDto,
  GroupListingDto,
  GroupMemberBasicDto,
  GroupMemberDto,
  GroupMemberListDto,
} from "../dtos/GroupDto";
import GroupMemberModel from "../database/models/GroupMemberModel";
import UnauthorizedError from "../exceptions/unauthorized-error";
import IMiscellaneousService from "./interface/IMiscellaneousService";
import { CurrentUserDto, UserBasicDto } from "../dtos/UserDto";
import sequelize from "../database/connection";
import IUserService from "./interface/IUserService";
import { GroupMemberAction } from "../enums/group.action.enum";

@injectable()
export default class GroupService implements IGroupService {
  private readonly userService: IUserService;
  private readonly miscellaneousService: IMiscellaneousService;
  private readonly currentUser: CurrentUserDto;
  private readonly currentUserGuid: string;
  private readonly currentUserId: number;

  constructor(
    @inject(TYPES.SocketIO) private io: SocketIOServer,
    @inject(TYPES.IMiscellaneousService)
    miscellaneousService: IMiscellaneousService,
    @inject(TYPES.IUserService) userService: IUserService
  ) {
    this.userService = userService;
    this.miscellaneousService = miscellaneousService;
    this.currentUser = this.miscellaneousService.currentUser();
    this.currentUserGuid = this.currentUser.guid;
    this.currentUserId = this.currentUser.id;
    // console.log("Injected io instance clients:", this.io.engine.clientsCount);
  }

  async createGroup(name: string): Promise<Response<GroupBasicDto>> {
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
      const group: GroupBasicDto = (await GroupModel.create(groupDbModel))
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

      const response: GroupBasicDto = group;

      if (response) {
        const socketsInRoom = await this.io.in(this.currentUserGuid).fetchSockets();
        console.log("Sockets in room:", socketsInRoom.length);

        const socketResponse = this.io
          .to("1")
          .emit("group_created", {
            groupId: group.id,
            name: group.name,
            createdBy: "1",
          });

        console.log("socketResponse", socketResponse);

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

  async getAllGroup(): Promise<Response<GroupListingDto[]>> {
    try {
      const user = (
        await this.userService.getByGuid(
          this.currentUserId,
          this.currentUserGuid
        )
      ).data as UserBasicDto;

      if (!user) throw new CustomError("User not found!", 400);

      const member = await GroupMemberModel.findAll({
        where: { memberId: user.guid, isActive: true, isDeleted: false },
        attributes: ["memberId", "isAdmin"],
        include: [
          {
            model: GroupModel,
            as: "groups",
            where: { isActive: true, isDeleted: false },
            attributes: ["id", "name"],
          },
        ],
      });

      const response: GroupListingDto[] = member.map((record) =>
        record.get({ plain: true })
      );

      if (response) {
        return {
          success: true,
          status: 200,
          message: "Chat contact listed successfully.",
          data: response,
        };
      } else {
        return {
          success: false,
          status: 400,
          message: "Failed to fetch chat contact list.",
        };
      }
    } catch (error) {
      console.error("Error while creating group:", error);
      return {
        success: false,
        message: `Error while creating group: ${error}`,
      };
    }
  }

  async getAllGroupMember(): Promise<Response<GroupMemberListDto[]>> {
    try {
      const user = (
        await this.userService.getByGuid(
          this.currentUserId,
          this.currentUserGuid
        )
      ).data as UserBasicDto;

      if (!user) throw new CustomError("User not found!", 400);

      const members = (
        await GroupMemberModel.findAll({
          where: { memberId: user.guid, isActive: true, isDeleted: false },
          attributes: ["memberId", "isAdmin"],
          include: [
            {
              model: GroupModel,
              as: "groups",
              where: { isActive: true, isDeleted: false },
              attributes: ["id", "name"],
            },
          ],
          nest: true,
        })
      ).map((record) => record.get({ plain: true }) as GroupListingDto);

      const groupIds: number[] = [...new Set(members.map((m) => m.groups.id))];

      const groupMembers = (
        await GroupMemberModel.findAll({
          where: {
            groupId: groupIds,
          },
          attributes: ["id", "groupId", "memberId", "isAdmin"],
        })
      ).map((record) => record.get({ plain: true }) as GroupMemberDto);

      const uniqueMemberGuid: string[] = [
        ...new Set(groupMembers.map((m) => m.memberId)),
      ];

      const users = (
        await UserModel.findAll({
          where: { guid: uniqueMemberGuid },
          attributes: ["id", "guid", "firstName", "lastName", "email"],
        })
      ).map((record) => record.get({ plain: true }) as UserBasicDto);

      const userMap = new Map(users.map((u) => [u.guid, u]));

      const response: GroupMemberListDto[] = groupIds.flatMap((groupId) => {
        const groupInfo = members.find((m) => m.groups.id === groupId)?.groups;
        const membersForGroup = groupMembers
          .filter((m) => m.groupId === groupId)
          .map((m) => {
            const user = userMap.get(m.memberId)!;
            return {
              groupId: m.groupId,
              memberId: m.memberId,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              isAdmin: m.isAdmin,
            };
          });

        return {
          group: groupInfo as GroupDto,
          members: membersForGroup as GroupMemberBasicDto[],
        };
      });

      if (response) {
        return {
          success: true,
          status: 200,
          message: "Group member listed successfully.",
          data: response,
        };
      } else {
        return {
          success: false,
          status: 400,
          message: "Failed to fetch group member list.",
        };
      }
    } catch (error) {
      console.error("Error while creating group:", error);
      return {
        success: false,
        message: `Error while creating group: ${error}`,
      };
    }
  }

  async getGroupMemberByGroupId(
    groupId: number
  ): Promise<Response<GroupMemberListDto[]>> {
    try {
      const user = (
        await this.userService.getByGuid(
          this.currentUserId,
          this.currentUserGuid
        )
      ).data as UserBasicDto;

      if (!user) throw new CustomError("User not found!", 400);

      const group = (await GroupModel.findOne({
        where: { id: groupId, isActive: true, isDeleted: false },
        attributes: ["id", "name"],
        raw: true,
      })) as GroupDto | null;

      if (!group) throw new CustomError("Group not found!", 400);

      const isCurrentUserMember = await GroupMemberModel.findOne({
        where: { groupId: group.id, memberId: user.guid },
      });

      if (!isCurrentUserMember) {
        throw new CustomError("You are not a member of this group", 400);
      }

      const groupMembers = (
        await GroupMemberModel.findAll({
          where: { groupId: group.id },
          attributes: ["id", "groupId", "memberId", "isAdmin"],
        })
      ).map((record) => record.get({ plain: true }) as GroupMemberDto);

      const uniqueMemberGuids: string[] = [
        ...new Set(groupMembers.map((m) => m.memberId)),
      ];

      const users = (
        await UserModel.findAll({
          where: { guid: uniqueMemberGuids },
          attributes: ["guid", "firstName", "lastName", "email"],
        })
      ).map((record) => record.get({ plain: true }) as UserBasicDto);

      const userMap = new Map(users.map((u) => [u.guid, u]));

      const members = groupMembers.map((m) => {
        const user = userMap.get(m.memberId)!;
        return {
          groupId: m.groupId,
          memberId: m.memberId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          isAdmin: m.isAdmin,
        };
      }) as GroupMemberBasicDto[];

      const response: GroupMemberListDto[] = [{ group, members }];

      if (!response) {
        return {
          success: false,
          status: 400,
          message: "Failed to fetch group member list.",
        };
      } else {
        return {
          success: true,
          status: 200,
          message: "Group member listed successfully.",
          data: response,
        };
      }
    } catch (error) {
      console.error("Error while creating group:", error);
      return {
        success: false,
        message: `Error while creating group: ${error}`,
      };
    }
  }

  async removeGroupParticipant(
    groupId: number,
    memberId: string,
    action: string
  ): Promise<Response<boolean>> {
    const t = await sequelize.transaction();
    try {
      const user = (
        await this.userService.getByGuid(
          this.currentUserId,
          this.currentUserGuid
        )
      ).data as UserBasicDto;

      if (!user) throw new CustomError("User not found!", 400);

      let isCurrentGroupExist;
      let member;
      if (action === GroupMemberAction.REMOVE) {
        member = memberId;
        isCurrentGroupExist = (await GroupModel.findOne({
          where: {
            id: groupId,
            adminId: this.currentUserGuid,
            isActive: true,
            isDeleted: false,
          },
          raw: true,
        })) as GroupDto | null;
      } else if (action === GroupMemberAction.LEAVE) {
        member = this.currentUserGuid;
        isCurrentGroupExist = (await GroupModel.findOne({
          where: {
            id: groupId,
            isActive: true,
            isDeleted: false,
          },
          raw: true,
        })) as GroupDto | null;
      }

      if (!isCurrentGroupExist) throw new CustomError("Group not found!", 400);

      const isHeAGroupMember = (await GroupMemberModel.findOne({
        where: {
          groupId: isCurrentGroupExist.id,
          memberId: member,
          isActive: true,
          isDeleted: false,
        },
        raw: true,
      })) as GroupMemberBasicDto | null;

      if (!isHeAGroupMember)
        throw new CustomError("Member not found in group!", 400);

      isHeAGroupMember.updatedBy = this.currentUserGuid;
      isHeAGroupMember.isActive = false;

      const response = await GroupMemberModel.update(isHeAGroupMember, {
        where: {
          id: isHeAGroupMember.id,
        },
      });

      if (response) {
        await t.commit();
        return {
          success: true,
          status: 200,
          message: "Group member removed successfully!",
          data: true,
        };
      } else {
        await t.rollback();
        return {
          success: false,
          status: 400,
          message: "Failed to remove from group.",
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

  async deleteGroup(groupId: number): Promise<Response<GroupDto>> {
    const t = await sequelize.transaction();
    try {
      const user = (
        await this.userService.getByGuid(
          this.currentUserId,
          this.currentUserGuid
        )
      ).data as UserBasicDto;

      if (!user) throw new CustomError("User not found!", 400);

      const group = (await GroupModel.findOne({
        where: {
          id: groupId,
          isActive: true,
          isDeleted: false,
        },
        raw: true,
      })) as GroupBasicDto | null;

      if (!group) throw new CustomError("Group not found!", 400);

      if (
        group &&
        group.adminId === this.currentUserGuid &&
        group.createdBy === this.currentUserGuid
      ) {
        group.isActive = false;
        group.isDeleted = true;
        group.updatedBy = this.currentUserGuid;
      }

      const response = await GroupModel.update(group, {
        where: { id: group.id, isActive: true, isDeleted: false },
      });

      if (response) {
        await t.commit();
        return {
          success: true,
          status: 204,
          message: "Group deleted successfully!",
        };
      } else {
        await t.rollback();
        return {
          success: false,
          status: 400,
          message: "Failed to delete group.",
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

  async addGroupAdmin(
    groupId: number,
    memberId: string
  ): Promise<Response<GroupBasicDto>> {
    const t = await sequelize.transaction();
    try {
      const user = (
        await this.userService.getByGuid(
          this.currentUserId,
          this.currentUserGuid
        )
      ).data as UserBasicDto;

      if (!user) throw new CustomError("User not found!", 400);

      const group = (await GroupModel.findOne({
        where: {
          id: groupId,
          adminId: this.currentUserGuid,
          isActive: true,
          isDeleted: false,
        },
        raw: true,
      })) as GroupBasicDto | null;

      if (!group) throw new CustomError("Group not found!", 400);

      const member = (await UserModel.findOne({
        where: { guid: memberId, isActive: true, isDeleted: false },
        attributes: ["id", "guid", "firstName", "lastName", "email"],
        raw: true,
      })) as UserBasicDto | null;

      if (!member) throw new CustomError("User not found!", 400);

      const groupMemberModel: GroupMemberDataModel = {
        groupId: group.id,
        memberId: member.guid,
        createdBy: this.currentUserGuid,
        isAdmin: true,
        isActive: true,
        isDeleted: false,
      };

      const { ...groupMemberDbModel } = groupMemberModel;
      const groupMember = (await GroupMemberModel.create(groupMemberDbModel))
        .dataValues;

      if (!groupMember)
        throw new CustomError("Some error occurred while adding member.", 400);

      const response: GroupBasicDto = group;

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
}
