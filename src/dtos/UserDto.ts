export default interface UserDto {
  id: number;
  guid: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: File;
  isActive: boolean;
  isDeleted?: boolean;
  token?: string;
}


export interface UserBasicDto {
  id: number;
  guid: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: File;
  isActive: boolean;
  isDeleted?: boolean;
}