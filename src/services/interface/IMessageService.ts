import { MessageDto } from "../../dtos/MessageDto";
import PlainDto from "../../dtos/PlainDto";
import Response from "../../dtos/Response";
import { MessageDataModel } from "../../models/MessageDataModel";

export default interface IMessageService {
  sendMessage(model: MessageDataModel): Promise<Response<MessageDto>>;
  message(chatId: number, userId: number): Promise<Response<MessageDto[]>>;
  editMessage(chatId: number, messageId: number, editMassages: string): Promise<Response<MessageDto>>;
  deleteMessage(chatId: number, messageId: number, action: string): Promise<Response<PlainDto>>;
}
