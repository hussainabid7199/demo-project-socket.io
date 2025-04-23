export default interface ChatDto{
  roomId: string;
  type: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
  createdBy?: string;
}

export interface ChatParticipantDto {
  id: number;
  chatId: number;
  userId: number;
  isAdmin: boolean;
  isAdminMsg: boolean;
  isMuted: boolean;
  isArchived: boolean;
  leaveGroup: boolean;
  removeGroup: boolean;
  isBlocked: boolean;
  blockedBy?: number;
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isActive: boolean;
  isDeleted?: boolean;
}
