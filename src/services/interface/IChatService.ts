import ChatDto, { ChatParticipantDto } from "../../dtos/ChatDto";
import { ContactDto } from "../../dtos/ContactDto";
import Response from "../../dtos/Response";
import { ChatActionDataModel } from "../../models/ChatDataModel";
import { GroupDataModel } from "../../models/GroupDataModel";

export default interface IChatService {
  oneToOneChat(userId: number): Promise<Response<ChatDto>>;
  groupChat(model: GroupDataModel): Promise<Response<ChatDto>>;
  chatAction(model: ChatActionDataModel): Promise<Response<ChatParticipantDto>>;
  getContact(): Promise<Response<ContactDto[]>>;
}
