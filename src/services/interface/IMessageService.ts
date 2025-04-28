import { MessageDto } from "../../dtos/MessageDto";
import Response from "../../dtos/Response";
import { MessageDataModel } from "../../models/MessageDataModel";

export default interface IMessageService {
  sendMessage(model: MessageDataModel): Promise<Response<MessageDto>>;
  message(chatId: number, userId: number): Promise<Response<MessageDto[]>>;
}
