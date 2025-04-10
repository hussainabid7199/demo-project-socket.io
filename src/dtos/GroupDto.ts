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
  members: GroupMemberListDto[];
}
export interface GroupMemberUserDto {
  group: GroupMemberDto;
  members: GroupMemberListDto[];
}



export interface GroupMemberListDto {
  id: number;
  groupId: number;
  memberId: string;
  isAdmin: boolean;
}
