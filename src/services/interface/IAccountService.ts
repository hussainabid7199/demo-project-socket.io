import LoginModel from "../../models/LoginDataModel";
import UserDto from "../../dtos/UserDto";
import UserModel  from "../../database/models/UserModel";
import Response from "../../dtos/Response";

export default interface IAccountService {
   login(model: LoginModel): Promise<Response<UserDto>>;
   register(model: UserModel): Promise<UserDto>;
}
