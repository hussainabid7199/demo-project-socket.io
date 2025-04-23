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
  chatId: number,
  userId: number,
  isAdmin?: boolean,
  isMuted?: boolean,
  isArchived?: boolean,
  isBlocked?: boolean,
  blockedBy?: string,
  createdBy?: string,
  updatedBy?: string,
  isActive?: boolean,
  isDeleted?: boolean
}

export interface ChatActionDataModel{
  type: string,
  chatId: number,
  userId: number,
  action: string
}

