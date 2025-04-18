import ChatUserListDto, { ChatContactDto, ChatExistDto } from "../../dtos/ChatDto";
import Response from "../../dtos/Response";

export default interface IChatService {
  getChatContact(): Promise<Response<ChatUserListDto[]>>;
  createChat(userId: number): Promise<Response<ChatContactDto>>;
  chatAction(userId: number, currentUserId: number, action: string): Promise<Response<ChatContactDto>>;
  chatExist(userId: number): Promise<Response<ChatExistDto>>;
}
