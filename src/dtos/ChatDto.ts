export default interface ChatDto {
  id: number;
  userId: number;
  socketId?: string;
  message: string;
}

export interface MessageDto {
  userId: string;
  socketId: string;
  message: string;
}
