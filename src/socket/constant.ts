export enum ChatEventEnum {

    CONNECTED_EVENT = "connected",
    DISCONNECT_EVENT = "disconnect", 
    JOIN_CHAT_EVENT = "joinChat",  // when user joins a socket room
    LEAVE_CHAT_EVENT = "leaveChat", // when participant gets removed from group, chat gets deleted or leaves a group
    UPDATE_GROUP_NAME_EVENT = "updateGroupName", // when admin updates a group name
    MESSAGE_RECEIVED_EVENT = "messageReceived",   // when new message is received
    NEW_CHAT_EVENT = "newChat",    // when there is new one on one chat, new group chat or user gets added in the group
    SOCKET_ERROR_EVENT = "socketError",
    STOP_TYPING_EVENT = "stopTyping",
    TYPING_EVENT = "typing",
    MESSAGE_DELETE_EVENT = "messageDeleted"
  }
  
  export const AvailableChatEvents = Object.values(ChatEventEnum);
  