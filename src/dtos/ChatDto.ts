export interface ChatDto {
  id: string;
  type: string;
  name: string;
  avatarUrl?: string;
  createdAt: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface ChatParticipantDto {
  chatId: string;
  userId: string;
  isAdmin?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  isBlocked?: boolean;
  blockedBy?: string | null;
  createdBy?: string;
  updatedBy?: string;
}
