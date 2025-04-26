export default interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: File;
  isActive: boolean;
  isDeleted?: boolean;
  token?: string;
}

export interface UserBasicDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: File;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface CurrentUserDto {
  id: string;
  email: string;
  fullName: string;
}

