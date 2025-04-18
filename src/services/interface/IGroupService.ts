import { GroupBasicDto, GroupDto, GroupListingDto, GroupMemberDto,  GroupMemberListDto } from "../../dtos/GroupDto";
import Response from "../../dtos/Response";

export default interface IGroupService {
  getAllGroup(): Promise<Response<GroupListingDto[]>>;
  getAllGroupMember(): Promise<Response<GroupMemberListDto[]>>;
  getGroupMemberByGroupId(groupId: number): Promise<Response<GroupMemberListDto[]>>;
  createGroup(name: string): Promise<Response<GroupBasicDto>>;
  addGroupAdmin(groupId: number, memberId: string): Promise<Response<GroupBasicDto>>
  addGroupParticipant(groupId: number, memberId: string): Promise<Response<GroupMemberDto>>;
  removeGroupParticipant(groupId: number, memberId: string, action: string): Promise<Response<boolean>>;
  deleteGroup(groupId: number): Promise<Response<GroupDto>>;
  //   getGroupDetails(userId: number, currentUserId: number): Promise<Response<ChatContactDto>>;
  //   updateGroupDetails(userId: number, currentUserId: number): Promise<Response<ChatContactDto>>;
  //   updateGroup(userId: number, currentUserId: number, action: string): Promise<Response<ChatContactDto>>;
  //   deleteGroupChat(userId: number, currentUserId: number, action: string): Promise<Response<ChatContactDto>>;
}
