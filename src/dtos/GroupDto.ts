export default interface GroupInviteDto{
  id: number;
  chatId: number;
  invitedUserId: number;
  invitedBy: number;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface GroupMemberDto {
  userId: number;
  fullName?: string;
  profilePicture?: string;
  isAdmin: boolean;
}
