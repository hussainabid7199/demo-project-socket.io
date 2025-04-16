import { MessageDto, MessageSendDto } from "../../dtos/MessageDto";
import Response from "../../dtos/Response";

export default interface IMessageService {
  getAllMessages(chatId: number): Promise<Response<MessageDto[]>>;
  sendMessage(chatId: number, receiverId: number, payload: string | File):Promise<Response<MessageSendDto>>
}
