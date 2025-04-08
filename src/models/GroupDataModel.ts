export interface GroupDataModel {
  adminId: string; 
  name: string;
  updatedBy?: string;
  createdBy?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface GroupMemberDataModel {
  groupId: number; 
  memberId: string;
  isAdmin?: boolean;
  createdBy?: string;
  isActive?: boolean;
  isDeleted?: boolean;
}


export interface GroupParticipantDataModel {
  groupId: number,
  memberId: string,
  currentUserId: number
}


