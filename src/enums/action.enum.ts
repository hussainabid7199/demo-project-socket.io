"use-strict"
export enum ChatAction {
  BLOCK = 'BLOCK',
  MUTE = 'MUTE',
  ARCHIVE = 'ARCHIVE'
}

export enum GroupActionStatus {
  JOINED = 'JOINED',
  ACTIVE = 'ACTIVE',
  LEAVE = 'LEAVE',
  REMOVED = 'REMOVED'
}

export enum MessagePermission {
  ADMIN = 'ADMIN',
  USER = 'USER',
  ALL = 'ALL'
}

export enum ChatType {
  PRIVATE = 'P',
  GROUP = 'G'
}

export enum GroupInviteStatus{
  PENDING = "PENDING", 
  ACCEPTED = "ACCEPTED", 
  DECLINED ="DECLINED"
}
