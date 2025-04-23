import * as Yup from "yup";
import { ChatActionDataModel } from "../models/ChatDataModel";
import { ChatAction, ChatType, GroupActionStatus } from "../enums/action.enum";

const ChatActionSchema: Yup.ObjectSchema<ChatActionDataModel> =
  Yup.object().shape({
    type: Yup.mixed<ChatType>()
    .oneOf([ChatType.PRIVATE, ChatType.GROUP])
    .required('Chat type is required'),
    chatId: Yup.number().required("Chat is required"),
    userId: Yup.number().required("User is required"),
    action: Yup.mixed<ChatAction | GroupActionStatus>()
    .oneOf([...Object.values(ChatAction), ...Object.values(GroupActionStatus)])
    .required('Chat type is required')
  });

export default ChatActionSchema;
