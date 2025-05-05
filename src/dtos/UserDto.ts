export default interface UserDto {
  id: number;
  guid: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
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
  profilePicture?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface CurrentUserDto {
  id: number;
  guid: string;
  email: string;
  fullName: string;
}

