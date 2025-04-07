export default interface ChatUserListDto {
  id: number;
  guid: string;
  firstName: string;
  lastName: string;
}

export interface MessageDto {
  userId: string;
  socketId: string;
  message: string;
}


export interface ChatContactDto {
  id: number;
  userId: number;
  currentUserId: number;
  isMuted: boolean;
  isArchived: boolean;
  isBlocked: boolean;
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
  isActive: boolean;
  isDeleted: boolean;
}
