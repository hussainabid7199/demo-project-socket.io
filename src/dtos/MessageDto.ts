export interface MessageDto {
    id: number;
    chatId: number;
    senderId: number;
    message: string;
    messageType: string;
    createdAt: string;
    createdBy: string;
    updatedAt?: string; 
    updatedBy?: string; 
    isActive: boolean;
    isDeleted?: boolean;
  }
  

  export interface MessageSendDto{
    chatId: number,
    senderId?: number,
    receiverId: number,
    payload: File | string
  }