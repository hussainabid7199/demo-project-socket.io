import * as Yup from "yup";
import { GroupInviteDataModel } from "../models/GroupDataModel";

const GroupInviteSchema: Yup.ObjectSchema<GroupInviteDataModel> = Yup.object({
  chatId: Yup.number()
    .required("Chat is required"),

  type: Yup.string().required("Type is required"),

  invitedUser: Yup.array().required("User is required").of(
    Yup.number()
      .typeError("Each participant must be a valid number")
      .required("Participant ID is required")
  ),
});

export default GroupInviteSchema;
