export interface ContactDto {
  chatId: number;
  roomId: string;
  userId?: number;
  chatType: string;
  fullName?: string;
  profilePicture?: string;
  groupName: string;
  groupDescription?: boolean;
}

