import ChatDto from "../../dtos/ChatDto";
import Response from "../../dtos/Response";

export default interface IChatService {
  oneToOneChat(userId: number): Promise<Response<ChatDto>>;
  groupChat(name: string, description: string, participant: number[]): Promise<Response<ChatDto>>;
  chatAction(type: string, chatId: number, userId: number, action: string): Promise<Response<ChatDto>>;
}
