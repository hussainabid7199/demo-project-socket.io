import { GroupDto, GroupMemberDto } from "../../dtos/GroupDto";
import Response from "../../dtos/Response";

export default interface IGroupService {
  createGroup(name: string): Promise<Response<GroupDto>>;
  addGroupParticipant(groupId: number, memberId: string): Promise<Response<GroupMemberDto>>;
  //   getAllGroup(id: number, guid: string): Promise<Response<ChatUserListDto[]>>;
  //   getGroupDetails(userId: number, currentUserId: number): Promise<Response<ChatContactDto>>;
  //   getAllGroupParticipant(userId: number, currentUserId: number, action: string): Promise<Response<ChatContactDto>>;
  //   getAllGroupParticipant(userId: number, currentUserId: number, action: string): Promise<Response<ChatContactDto>>;
  //   updateGroupDetails(userId: number, currentUserId: number): Promise<Response<ChatContactDto>>;
  //   updateGroup(userId: number, currentUserId: number, action: string): Promise<Response<ChatContactDto>>;
  //   removeGroupParticipant(userId: number, currentUserId: number, action: string): Promise<Response<ChatContactDto>>;
  //   leaveGroup(userId: number, currentUserId: number, action: string): Promise<Response<ChatContactDto>>;
  //   deleteGroupChat(userId: number, currentUserId: number, action: string): Promise<Response<ChatContactDto>>;
}
