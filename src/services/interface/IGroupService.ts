import GroupInviteDto, { GroupMemberDto } from "../../dtos/GroupDto";
import Response from "../../dtos/Response";
import { GroupInviteActionDataModel, GroupInviteDataModel } from "../../models/GroupDataModel";

export default interface IGroupService {
  inviteGroupParticipant(model: GroupInviteDataModel): Promise<Response<GroupInviteDto[]>>;
  invitationAction(model: GroupInviteActionDataModel): Promise<Response<GroupInviteDto>>;
  groupMember(chatId: number): Promise<Response<GroupMemberDto[]>>;
}
