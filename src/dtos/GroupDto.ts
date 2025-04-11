import { UserBasicDto } from "./UserDto";

export interface GroupDto {
  id: number;
  adminId: string;
  name: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface GroupMemberBasicDto {
  id: number;
  groupId: number;
  memberId: string;
  isAdmin: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  isActive: boolean;
  isDeleted: boolean;
}

export interface GroupMemberDto {
  groupId: number;
  groupName: string;
  memberName: string;
}

export interface GroupListingDto {
  memberId: string;
  isAdmin?: boolean;
  groups: {
    id: number;
    name: string;
  };
}

export interface GroupMemberListingDto {
  groupId: number;
  memberId: string;
  isAdmin: boolean;
}

export interface MemberListingDto {
  group: GroupListingDto;
  members: GroupMemberDto[];
}
export interface GroupMemberUserDto {
  group: GroupMemberDto;
  members: GroupMemberDto[];
}

export interface GroupMemberUserTestDto {
  group: GroupMemberDto;
  user?: UserBasicDto;
  members: GroupMemberDto[];
}

export interface GroupMemberDto {
  id: number;
  groupId: number;
  memberId: string;
  isAdmin: boolean;
}

// Updated Dto Below

export interface GroupDto {
  id: number;
  name: string;
}

export interface GroupMemberBasicDto {
  groupId: number;
  memberId: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
}

export interface GroupMemberListDto {
  group: GroupDto;
  members: GroupMemberBasicDto[];
}
