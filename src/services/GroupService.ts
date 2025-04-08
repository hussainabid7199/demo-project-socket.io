import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { Server as SocketIOServer } from "socket.io";
import Response from "../dtos/Response";
import IUserService from "./interface/IUserService";
import IGroupService from "./interface/IGroupService";
import UserModel from "../database/models/UserModel";
import CustomError from "../exceptions/custom-error";
import GroupModel from "../database/models/GroupModel";
import { GroupDataModel, GroupMemberDataModel } from "../models/GroupDataModel";
import { GroupDto, GroupMemberDto } from "../dtos/GroupDto";
import GroupMemberModel from "../database/models/GroupMemberModel";
import UnauthorizedError from "../exceptions/unauthorized-error";

@injectable()
export default class GroupService implements IGroupService {
  private readonly _userService: IUserService;

  constructor(
    @inject(TYPES.SocketIO) private io: SocketIOServer,
    @inject(TYPES.IUserService)
    userService: IUserService
  ) {
    this._userService = userService;
  }

  async createGroup(
    adminId: string,
    name: string
  ): Promise<Response<GroupDto>> {
    const userExist = await UserModel.findOne({ where: { guid: adminId } });

    if (!userExist) throw new CustomError("User not found!", 400);

    const groupModel: GroupDataModel = {
      adminId: adminId,
      name: name,
      createdBy: userExist.dataValues.guid,
      isActive: true,
      isDeleted: false,
    };

    const { ...groupDbModel } = groupModel;
    const group: GroupDto = (await GroupModel.create(groupDbModel)).dataValues;

    if (!group)
      throw new CustomError("Some error occurred while creating group.", 400);

    const groupMemberModel: GroupMemberDataModel = {
      groupId: group.id,
      memberId: group.adminId,
      createdBy: group.adminId,
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
      return {
        success: true,
        data: response,
      };
    } else {
      return {
        success: false,
        message: "Message failed",
      };
    }
  }

  async addGroupParticipant(
    groupId: number,
    memberId: string,
    currentUserId: number
  ): Promise<Response<GroupMemberDto>> {
    const groupExist = await GroupModel.findOne({ where: { id: groupId }});

    if (!groupExist) throw new CustomError("Group not found!", 400);

    const [currentUserExist, memberExist] = await Promise.all([
      UserModel.findOne({ where: { guid: currentUserId } }),
      UserModel.findOne({ where: { guid: memberId } }),
    ]);

    if (!currentUserExist || !memberExist)
      throw new CustomError("User not found!", 400);

    const [isCurrentUserGroupMember, isMemberExist] = await Promise.all([
      GroupMemberModel.findOne({
        where: { memberId: currentUserExist.dataValues.guid },
      }),
      GroupMemberModel.findOne({
        where: { memberId: memberExist.dataValues.guid },
      }),
    ]);

    if (isMemberExist) throw new CustomError("Already added to group", 400);

    if (
      isCurrentUserGroupMember &&
      !isCurrentUserGroupMember.dataValues.isAdmin
    )
      throw new UnauthorizedError("Unauthorized to add member");

    const model: GroupMemberDataModel = {
      groupId: groupExist.dataValues.id,
      memberId: memberExist.dataValues.guid,
      createdBy: currentUserExist.dataValues.guid,
      isAdmin: false,
      isActive: true,
      isDeleted: false,
    };

    
    const { ...dbModel } = model;
    const response = (await GroupMemberModel.create(dbModel)).dataValues;

    if (response) {
      return {
        success: true,
        data: response,
      };
    } else {
      return {
        success: false,
        message: "Message failed",
      };
    }
  }
}
