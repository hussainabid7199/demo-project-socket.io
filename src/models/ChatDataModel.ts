export interface ChatContactDataModel {
    userId: number;
    currentUserId: number;
    isMuted: boolean;
    isArchived: boolean;
    isBlocked: boolean;
    createdBy: string;
    isActive?: boolean;
    isDeleted?: boolean;
  }
  