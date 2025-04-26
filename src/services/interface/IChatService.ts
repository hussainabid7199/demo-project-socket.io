import { ChatDto } from "../../dtos/ChatDto";
import Response from "../../dtos/Response";
import { ChatDataModel } from "../../models/ChatDataModel";

export default interface IChatService {
  get(): Promise<Response<ChatDto[]>>;
  getById(id: string): Promise<Response<ChatDto>>;
  add(id: string, model: ChatDataModel): Promise<Response<ChatDto>>;
}
