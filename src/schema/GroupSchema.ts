import * as Yup from "yup";
import { GroupDataModel } from "../models/GroupDataModel";

const GroupSchema: Yup.ObjectSchema<GroupDataModel> = Yup.object({
  name: Yup.string()
    .required("Group name is required")
    .max(100, "Group name must be at most 100 characters"),

  description: Yup.string().max(
    500,
    "Description must be at most 500 characters"
  ),

  participant: Yup.array().of(
    Yup.number()
      .typeError("Each participant must be a valid number")
      .required("Participant ID is required")
  ),
});

export default GroupSchema;
