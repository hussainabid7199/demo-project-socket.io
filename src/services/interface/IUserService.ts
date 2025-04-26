import Response from "../../dtos/Response";
import { UserBasicDto } from "../../dtos/UserDto";

export default interface IUserService {
  get(): Promise<Response<UserBasicDto[]>>;
  getById(id: string): Promise<Response<UserBasicDto>>;
}
