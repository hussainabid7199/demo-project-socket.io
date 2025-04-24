export default interface ChatDto{
  id: number;
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
  isActive: boolean;
  isDeleted?: boolean;
}
