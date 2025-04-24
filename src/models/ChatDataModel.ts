export interface ChatContactDataModel {
    roomId: string;
    type: string;
    name?: string;
    description?: string;
    avatarUrl?: string;
    createdBy?: string;
    updatedBy?: string;
}
  
export interface ChatParticipantDataModel{
  chatId: number;
  userId: number;
  isAdmin?: boolean;
  isAdminMsg?: boolean;
  isMuted?: boolean;
  isArchived?: boolean;
  leaveGroup?: boolean;
  removeGroup?: boolean;
  isBlocked?: boolean;
  blockedBy?: number;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface ChatActionDataModel{
  type: string,
  chatId: number,
  userId: number,
  action: string
}

