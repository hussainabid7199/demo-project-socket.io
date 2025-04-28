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