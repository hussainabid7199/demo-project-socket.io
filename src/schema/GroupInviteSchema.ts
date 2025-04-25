import * as Yup from "yup";
import { GroupInviteDataModel } from "../models/GroupDataModel";

const GroupInviteSchema: Yup.ObjectSchema<GroupInviteDataModel> = Yup.object({
  chatId: Yup.number().required("Chat is required"),

  type: Yup.string()
    .required("Chat type is required.")
    .max(5, "Chat type is required."),

  invitedUser: Yup.array()
    .of(
      Yup.number()
        .typeError("Each participant must be a valid number")
        .required("Participant ID is required")
    )
    .required("User is required"),
});

export default GroupInviteSchema;
