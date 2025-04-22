// import { inject, injectable } from "inversify";
// import { TYPES } from "../config/types";
// import IChatService from "./interface/IChatService";
// import Response from "../dtos/Response";
// import ChatUserListDto, { ChatContactDto, ChatExistDto } from "../dtos/ChatDto";
// import IUserService from "./interface/IUserService";
// import ChatContactModel from "../database/models/ChatContactModel";
// import { ChatContactDataModel } from "../models/ChatDataModel";
// import { CurrentUserDto, UserBasicDto } from "../dtos/UserDto";
// import { ChatAction } from "../enums/chat.action.enum";
// import UserModel from "../database/models/UserModel";
// import IMiscellaneousService from "./interface/IMiscellaneousService";
// import { SocketServer } from "../socket";
// import { ChatEventEnum } from "../socket/constant";
// import { Op } from "sequelize";

// @injectable()
// export default class ChatService implements IChatService {
//   private readonly userService: IUserService;
//   private readonly miscellaneousService: IMiscellaneousService;
//   private readonly currentUser: CurrentUserDto;
//   private readonly currentUserId: number;
//   private readonly currentUserGuid: string;

//   constructor(
//     @inject(TYPES.SocketServer) private io: SocketServer,
//     @inject(TYPES.IUserService) userService: IUserService,
//     @inject(TYPES.IMiscellaneousService)
//     miscellaneousService: IMiscellaneousService
//   ) {
//     this.userService = userService;
//     this.miscellaneousService = miscellaneousService;
//     this.currentUser = this.miscellaneousService.currentUser();
//     this.currentUserId = this.currentUser.id;
//     this.currentUserGuid = this.currentUser.guid;
//   }

//   // Max response time 25ms Min response time 19ms
//   async getChatContact(): Promise<Response<ChatUserListDto[]>> {
//     const chats = await ChatContactModel.findAll({
//       where: {
//         [Op.or]: [
//           { currentUserId: this.currentUserId },
//           { userId: this.currentUserId },
//         ],
//         isActive: true,
//         isDeleted: false,
//       },
//       include: [
//         {
//           model: UserModel,
//           as: "user",
//           attributes: ["id", "guid", "firstName", "lastName"],
//         },
//       ],
//     });

//     const seenIds = new Set<number>();
//     const response = chats.reduce<ChatUserListDto[]>((acc, x) => {
//       const user = x.dataValues.user.dataValues;
//       if (!seenIds.has(user.id)) {
//         seenIds.add(user.id);
//         acc.push(user);
//       }
//       return acc;
//     }, []);

//     if (response) {
//       return {
//         success: true,
//         status: 200,
//         message: "Chat contact listed successfully.",
//         data: response,
//       };
//     } else {
//       return {
//         success: false,
//         status: 400,
//         message: "Failed to fetch chat contact list.",
//       };
//     }
//   }

//   async createChat(userId: number): Promise<Response<ChatContactDto>> {
//     const [existingUserResult, currentUserResult] = await Promise.all([
//       this.userService.getById(userId),
//       this.userService.getById(this.currentUserId),
//     ]);

//     const existingUser = existingUserResult.data;
//     const currentUserExist = currentUserResult.data;

//     if (!existingUser || !currentUserExist) {
//       return {
//         success: false,
//         status: 400,
//         message: "Some error occurred while creating chat",
//       };
//     }

//     const user: UserBasicDto = existingUser;
//     const currentUser: UserBasicDto = currentUserExist;

//     const existingChatWithCurrentUser = await ChatContactModel.findOne({
//       where: {
//         userId: user.id,
//         currentUserId: currentUser.id,
//         isActive: true,
//         isDeleted: false,
//       },
//       raw: true,
//     });

//     if (existingChatWithCurrentUser) {
//       return {
//         success: false,
//         status: 400,
//         message: "Chat already exist.",
//       };
//     }

//     const model: ChatContactDataModel = {
//       userId: user.id || 0,
//       currentUserId: this.currentUserId,
//       isArchived: false,
//       isBlocked: false,
//       isMuted: false,
//       createdBy: currentUser.guid,
//     };

//     const { ...dbModel } = model;

//     this.io.emitSocketEvent(
//       this.currentUserGuid,
//       ChatEventEnum.NEW_CHAT_EVENT,
//       dbModel
//     );

//     const response = (await ChatContactModel.create(dbModel)).dataValues;

//     if (response) {
//       return {
//         success: true,
//         status: 200,
//         message: "Chat created successfully!",
//         data: response,
//       };
//     } else {
//       return {
//         success: false,
//         status: 400,
//         message: "Failed to create chat.",
//       };
//     }
//   }

//   async chatExist(userId: number): Promise<Response<ChatExistDto>> {
//     const [existingUserResult, currentUserResult] = await Promise.all([
//       this.userService.getById(userId),
//       this.userService.getById(this.currentUserId),
//     ]);

//     const existingUser = existingUserResult.data;
//     const currentUserExist = currentUserResult.data;

//     if (!existingUser || !currentUserExist) {
//       return {
//         success: false,
//         status: 400,
//         message: "Some error occurred while creating chat",
//       };
//     }

//     const user: UserBasicDto = existingUser;
//     const currentUser: UserBasicDto = currentUserExist;

//     const [existingChatWithCurrentUser, existingChatWithPassedUser] =
//       await Promise.all([
//         (await ChatContactModel.findOne({
//           where: {
//             userId: user.id,
//             currentUserId: currentUser.id,
//             isActive: true,
//             isDeleted: false,
//           },
//           raw: true,
//         })) as ChatContactDto | null,
//         (await ChatContactModel.findOne({
//           where: {
//             userId: currentUser.id,
//             currentUserId: user.id,
//             isActive: true,
//             isDeleted: false,
//           },
//         })) as ChatContactDto | null,
//       ]);

//     if (!existingChatWithCurrentUser && !existingChatWithPassedUser) {
//       return {
//         success: false,
//         status: 400,
//         message: "Chat don't exist.",
//       };
//     }

//     let chatIdOfCurrentUser: number = 0;
//     let chatIdOfPassedUser: number = 0;
//     let chatId: number = 0;
//     let chatCurrentUserId: number = 0;
//     let chatPassedUserId: number = 0;

//     if (existingChatWithCurrentUser) {
//       chatIdOfCurrentUser = existingChatWithCurrentUser.id;
//       chatCurrentUserId = existingChatWithCurrentUser.currentUserId;
//       chatPassedUserId = existingChatWithCurrentUser.userId;
//     }

//     if (existingChatWithPassedUser) {
//       chatIdOfPassedUser = existingChatWithPassedUser.id;
//       chatCurrentUserId = existingChatWithPassedUser.currentUserId;
//       chatPassedUserId = existingChatWithPassedUser.userId;
//     }

//     chatId = chatIdOfPassedUser || chatIdOfCurrentUser;

//     const response: ChatExistDto = {
//       chatId: chatId,
//       chatCurrentUserId: chatCurrentUserId,
//       chatPassedUserId: chatPassedUserId,
//     };

//     if (
//       response &&
//       response.chatId &&
//       response.chatCurrentUserId &&
//       response.chatPassedUserId
//     ) {
//       return {
//         success: false,
//         status: 200,
//         message: "Chat exist.",
//         data: response,
//       };
//     } else {
//       return {
//         success: false,
//         status: 400,
//         message: "Chat don't exist.",
//       };
//     }
//   }

//   async chatAction(
//     userId: number,
//     currentUserId: number,
//     action: string
//   ): Promise<Response<ChatContactDto>> {
//     const [existingUserResult, currentUserResult] = await Promise.all([
//       this.userService.getById(userId),
//       this.userService.getById(currentUserId),
//     ]);

//     const existingUser = existingUserResult.data;
//     const currentUserExist = currentUserResult.data;

//     if (!existingUser || !currentUserExist) {
//       return {
//         success: false,
//         status: 400,
//         message: "Some error occurred while creating chat",
//       };
//     }

//     const user: UserBasicDto = existingUser;
//     const currentUser: UserBasicDto = currentUserExist;
//     const updatePayload: Partial<ChatContactDto> = {};
//     const isChatAvailable: ChatContactDto = (
//       await ChatContactModel.findOne({
//         where: {
//           userId: user.id,
//           currentUserId: currentUser.id,
//           isActive: true,
//           isDeleted: false,
//         },
//       })
//     )?.dataValues;

//     if (!isChatAvailable) {
//       return {
//         success: false,
//         status: 400,
//         message: "Chat don't exist",
//       };
//     }

//     switch (action) {
//       case ChatAction.BLOCK:
//         if (isChatAvailable.isBlocked) {
//           return {
//             success: false,
//             status: 400,
//             message: "Already blocked",
//           };
//         } else {
//           updatePayload.isBlocked = true;
//           isChatAvailable.isBlocked = true;
//         }
//         break;

//       case ChatAction.MUTE:
//         if (isChatAvailable.isMuted) {
//           return {
//             success: false,
//             status: 400,
//             message: "Already muted",
//           };
//         } else {
//           updatePayload.isMuted = true;
//           isChatAvailable.isMuted = true;
//         }
//         break;

//       case ChatAction.ARCHIVE:
//         if (isChatAvailable.isArchived) {
//           return {
//             success: false,
//             status: 400,
//             message: "Already archived",
//           };
//         } else {
//           updatePayload.isArchived = true;
//           isChatAvailable.isArchived = true;
//         }
//         break;
//     }

//     const response = await ChatContactModel.update(updatePayload, {
//       where: {
//         id: isChatAvailable.id,
//       },
//     });

//     if (response) {
//       return {
//         success: true,
//         status: 200,
//         message: "Chat created successfully!",
//         data: isChatAvailable,
//       };
//     } else {
//       return {
//         success: false,
//         status: 400,
//         message: "Failed to create chat.",
//       };
//     }
//   }
// }
