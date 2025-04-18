
import { CurrentUserDto } from "../../dtos/UserDto";

export default interface IMiscellaneousService {
  currentUser(): CurrentUserDto;
}
