import * as Yup from "yup";
import { MessageDataModel } from "../models/MessageDataModel";

const MessageSchema: Yup.ObjectSchema<MessageDataModel> = Yup.object({
  chatId: Yup.number().required("Chat is required"),
  message: Yup.string().required("Message is required"),
  senderId: Yup.number(),
  messageType: Yup.string().required("Message type is required"),
});
export default MessageSchema;
