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

export interface GroupMemberDto {
  groupId: number;
  groupName: string;
  memberName: string;
}
