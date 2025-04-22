export default interface ChatDto{
  roomId: string;
  type: string;
  name?: string;
  description?: string;
  avatarUrl?: string;
  createdBy?: string;
}
