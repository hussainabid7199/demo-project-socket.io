export interface MessageDataModel {
  chatId: number;
  message: string;
  senderId?: number
  messageType: string;
}


export interface MessageBasicDataModel {
  chatId: number;
  message: string;
  senderId?: number
  messageType: string;
  createdAt?: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface MessageEditDataModel {
  messageId: number;
  oldMessage: string;
  newMessage: string;
  createdAt?: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  isActive: boolean;
  isDeleted?: boolean;
}

export interface MessageDeleteDataModel {
  messageId: number;
  deletedBy: string;
  createdAt?: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  isActive: boolean;
  isDeleted?: boolean;
}