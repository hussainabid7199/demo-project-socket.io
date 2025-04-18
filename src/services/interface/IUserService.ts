import Response from "../../dtos/Response";
import { UserBasicDto } from "../../dtos/UserDto";

export default interface IUserService {
  get(): Promise<Response<UserBasicDto[]>>;
  getById(id: number): Promise<Response<UserBasicDto>>;
  getByGuid(id: number, guid: string): Promise<Response<UserBasicDto>>;
}
