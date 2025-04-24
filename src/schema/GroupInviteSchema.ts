import * as Yup from "yup";
import { GroupInviteActionDataModel } from "../models/GroupDataModel";

const GroupInviteActionSchema: Yup.ObjectSchema<GroupInviteActionDataModel> =
  Yup.object({
    chatId: Yup.number().required("Chat is required"),

    userId: Yup.number().required("Type is required"),

    status: Yup.string()
      .required("Status is required")
  });
export default GroupInviteActionSchema;
