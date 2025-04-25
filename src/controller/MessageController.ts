// "use-strict";
// import { Request, Response } from "express";
// import { inject } from "inversify";
// import {
//   controller,
//   httpGet,
//   interfaces,
//   request,
//   response,
// } from "inversify-express-utils";
// import { TYPES } from "../config/types";
// import IChatService from "../services/interface/IChatService";
// import { authentication } from "../middleware/authentication.middleware";
// import IUserService from "../services/interface/IUserService";
// import IMiscellaneousService from "../services/interface/IMiscellaneousService";
// import { CurrentUserDto } from "../dtos/UserDto";
// import { ContactDto } from "../dtos/ContactDto";

// @controller("/message")
// export class MessageController implements interfaces.Controller {
//   private readonly chatService: IChatService;
//   private readonly userService: IUserService;
//   private readonly messageService: IMessageService;
//   private readonly miscellaneousService: IMiscellaneousService;
//   private readonly currentUser: CurrentUserDto;
//   private readonly currentUserId: number;
//   private readonly currentUserGuid: string;

//   constructor(
//     @inject(TYPES.IChatService) chatService: IChatService,
//     @inject(TYPES.IUserService) userService: IUserService,
//     @inject(TYPES.IMessageService) messageService: IMessageService,
//     @inject(TYPES.IMiscellaneousService)
//     miscellaneousService: IMiscellaneousService
//   ) {
//     this.chatService = chatService;
//     this.userService = userService;
//     this.messageService = messageService;
//     this.miscellaneousService = miscellaneousService;
//     this.currentUser = this.miscellaneousService.currentUser();
//     this.currentUserId = this.currentUser.id;
//     this.currentUserGuid = this.currentUser.guid;
//   }

//   @httpGet("/contact", authentication)
//   public async messages(
//     @request() req: Request,
//     @response() res: Response
//   ): Promise<Response<ContactDto[] | void>> {
//     try {
//       const response = await this.messageService.getContact();

//       if (response && response.data && response.success) {
//         return res.status(200).json(response);
//       } else {
//         return res.status(400).json(response);
//       }
//     } catch (error) {
//       console.error("Error while fetching the messages:", error);
//       return res.status(500).json({
//         success: false,
//         message: "Internal server error",
//         error: "Internal server error",
//       });
//     }
//   }
// }
