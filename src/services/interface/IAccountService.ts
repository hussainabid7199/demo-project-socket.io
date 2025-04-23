import LoginModel from "../../models/LoginDataModel";
import UserDto from "../../dtos/UserDto";
import Response from "../../dtos/Response";

export default interface IAccountService {
   login(model: LoginModel): Promise<Response<UserDto>>;
}
