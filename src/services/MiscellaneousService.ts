import { injectable } from "inversify";

import IMiscellaneousService from "./interface/IMiscellaneousService";
import { CurrentUserDto } from "../dtos/UserDto";
import { storageContext } from "../context/async-storage-context";

@injectable()
export default class MiscellaneousService implements IMiscellaneousService {
  currentUser(): CurrentUserDto {
    const id = storageContext.get("id");
    const guid = storageContext.get("guid");
    const email = storageContext.get("email");
    const fullName = storageContext.get("fullName");

    return { id, guid, email, fullName };
  }
}
