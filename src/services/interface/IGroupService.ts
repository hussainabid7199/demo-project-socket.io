import GroupInviteDto from "../../dtos/GroupDto";
import Response from "../../dtos/Response";
import { GroupInviteDataModel } from "../../models/GroupDataModel";

export default interface IGroupService {
  inviteGroupParticipant(model: GroupInviteDataModel): Promise<Response<GroupInviteDto[]>>
}
