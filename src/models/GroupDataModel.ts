export interface GroupDataModel {
  name: string,
  description?: string,
  participant?: number[]
}

export interface GroupInviteDataModel{
  chatId: number,
  type: string,
  invitedUser: number[]
}

export default interface GroupInviteBasicDataModel{
  id: number;
  chatId: number;
  invitedUserId: number;
  invitedBy: number;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isActive: boolean;
  isDeleted: boolean;
}

