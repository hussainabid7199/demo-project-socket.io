import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import Response from "../dtos/Response";
import IGroupService from "./interface/IGroupService";
import IMiscellaneousService from "./interface/IMiscellaneousService";
import UserDto, { CurrentUserDto } from "../dtos/UserDto";
import IUserService from "./interface/IUserService";
import { SocketServer } from "../socket";
import GroupInviteDto from "../dtos/GroupDto";
import ChatModel from "../database/models/ChatModel";
import ChatDto, { ChatParticipantDto } from "../dtos/ChatDto";
import UserModel from "../database/models/UserModel";
import ChatParticipantModel from "../database/models/ChatParticipantModel";
import { Op, Optional } from "sequelize";
import { GroupInviteStatus } from "../enums/action.enum";
import GroupInviteModel from "../database/models/GroupInviteModel";
import GroupInviteBasicDataModel, {
  GroupInviteDataModel,
} from "../models/GroupDataModel";
import Error from "../exceptions/error-handler";

@injectable()
export default class GroupService implements IGroupService {
  private readonly userService: IUserService;
  private readonly miscellaneousService: IMiscellaneousService;
  private readonly currentUser: CurrentUserDto;
  private readonly currentUserGuid: string;
  private readonly currentUserId: number;

  constructor(
    @inject(TYPES.SocketServer) private io: SocketServer,
    @inject(TYPES.IMiscellaneousService)
    miscellaneousService: IMiscellaneousService,
    @inject(TYPES.IUserService) userService: IUserService
  ) {
    this.userService = userService;
    this.miscellaneousService = miscellaneousService;
    this.currentUser = this.miscellaneousService.currentUser();
    this.currentUserGuid = this.currentUser.guid;
    this.currentUserId = this.currentUser.id;
  }

  async inviteGroupParticipant(
    model: GroupInviteDataModel
  ): Promise<Response<GroupInviteDto[]>> {
    try {
      const users = (await UserModel.findAll({
        where: {
          id: model.invitedUser,
          isActive: true,
          isDeleted: false,
        },
        raw: true,
      })) as unknown as UserDto[];

      if (users.length == 0) {
        return {
          success: false,
          status: 400,
          message: "User not found.",
        };
      }

      const chat = (await ChatModel.findOne({
        where: {
          id: model.chatId,
          type: model.type,
          isActive: true,
          isDeleted: false,
        },
        raw: true,
      })) as ChatDto | null;

      if (!chat) {
        return {
          success: false,
          status: 400,
          message: "Chat not found.",
        };
      }

      const isCurrentUserParticipant = (await ChatParticipantModel.findOne({
        where: {
          chatId: chat.id,
          userId: this.currentUserId,
          isActive: true,
          isDeleted: false,
        },
        raw: true,
      })) as ChatParticipantDto | null;

      if (!isCurrentUserParticipant) {
        return {
          success: false,
          status: 401,
          message: "You are not authorized to add participant",
        };
      }

      const userIds: number[] = users.map((x) => x.id);
      const participant = (await ChatParticipantModel.findAll({
        where: {
          chatId: chat.id,
          userId: userIds,
          isActive: true,
          isDeleted: false,
        },
        raw: true,
      })) as unknown as ChatParticipantDto[];

      if (participant.length > 0 && participant) {
        return {
          success: false,
          status: 400,
          message: "Participant already exist.",
        };
      }

      const isAlreadyInvited = await GroupInviteModel.findAll({
        where: {
          chatId: chat.id,
          invitedUserId: userIds,
          status: {
            [Op.in]: [GroupInviteStatus.PENDING, GroupInviteStatus.ACCEPTED],
          },
          isActive: true,
          isDeleted: false,
        },
      });

      if (isAlreadyInvited.length != 0) {
        return {
          success: false,
          status: 400,
          message: "Users already invited.",
        };
      }

      const invitePayloads: Partial<GroupInviteBasicDataModel>[] = userIds.map(
        (userId) => ({
          chatId: chat.id,
          invitedUserId: userId,
          invitedBy: this.currentUserId,
          status: GroupInviteStatus.PENDING,
          createdBy: this.currentUserGuid,
          isActive: true,
          isDeleted: false,
        })
      );

      const inviteParticipant = await GroupInviteModel.bulkCreate(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        invitePayloads as unknown as Optional<any, string>[]
      );

      const response = inviteParticipant as unknown as GroupInviteDto[];

      if (response) {
        return {
          success: true,
          status: 200,
          message: "Invitation sent successfully.",
          data: response,
        };
      } else {
        return {
          success: false,
          status: 400,
          message: "Some error occurred while sending invitation",
        };
      }
    } catch (error) {
      return Error.Handler(
        error,
        "DATABASE_ERROR",
        400,
        "Some error occurred while sending group invitation"
      );
    }
  }
}
