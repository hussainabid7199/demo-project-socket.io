import { ChatContactDto } from "../../dtos/ChatDto";
import Response from "../../dtos/Response";

export default interface IChatService {
  getChatContact(id: number, guid: string): Promise<Response<ChatContactDto[]>>;
  createChat(userId: number, currentUserId: number): Promise<Response<ChatContactDto>>;
  chatAction(userId: number, currentUserId: number, action: string): Promise<Response<ChatContactDto>>
}
