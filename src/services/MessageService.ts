// import { inject, injectable } from "inversify";
// import IMessageService from "./interface/IMessageService";
// import IUserService from "./interface/IUserService";
// import IMiscellaneousService from "./interface/IMiscellaneousService";
// import { TYPES } from "../config/types";
// import { CurrentUserDto } from "../dtos/UserDto";
// import { SocketServer } from "../socket";
// import IChatService from "./interface/IChatService";

// @injectable()
// export default class MessageService implements IMessageService {
//   private readonly userService: IUserService;
//   private readonly chatService: IChatService;
//   private readonly miscellaneousService: IMiscellaneousService;
//   private readonly currentUser: CurrentUserDto;
//   private readonly currentUserGuid: string;
//   private readonly currentUserId: number;

//   constructor(
//     @inject(TYPES.SocketServer) private io: SocketServer,
//     @inject(TYPES.IChatService) chatService: IChatService,
//     @inject(TYPES.IMiscellaneousService)
//     miscellaneousService: IMiscellaneousService,
//     @inject(TYPES.IUserService) userService: IUserService
//   ) {
//     this.userService = userService;
//     this.chatService = chatService;
//     this.miscellaneousService = miscellaneousService;
//     this.currentUser = this.miscellaneousService.currentUser();
//     this.currentUserGuid = this.currentUser.guid;
//     this.currentUserId = this.currentUser.id;
//   }

  
// }
