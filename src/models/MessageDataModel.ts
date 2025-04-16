export interface MessageDataModel {
    chatContactId?: number;
    groupId?: number;
    groupMemberId?: number;
    currentUserId: number;
    message: string | File;
    createdBy: string;
    isActive: boolean;
    isDeleted?: boolean;
  }
  