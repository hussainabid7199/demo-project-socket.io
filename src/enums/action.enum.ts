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

export enum DeleteActon{
  DELETE_FOR_ME = "FOR_ME", 
  DELETE_FOR_EVERY_ONE = "FOR_EVERYONE",
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

