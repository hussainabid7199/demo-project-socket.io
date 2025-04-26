export interface ChatDataModel {
  type: string;
  name: string;
  avatarUrl?: string;
  createdBy?: string;
  updatedBy?: string | null;
}

export interface ChatParticipantDataModel {
  chatId: string;
  userId: string;
  isAdmin: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isBlocked: boolean;
  blockedBy?: string | null;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive: boolean;
  isDeleted: boolean;
}
