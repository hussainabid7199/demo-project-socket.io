"use-strict";
import { Container } from "inversify";
import { TYPES } from "./types";
import IUserService from "../services/interface/IUserService";
import IAccountService from "../services/interface/IAccountService";
import IMiscellaneousService from "../services/interface/IMiscellaneousService";

import { SocketServer } from "../socket";
import UserService from "../services/UserService";
import AccountService from "../services/AccountService";
import MiscellaneousService from "../services/MiscellaneousService";

export function createContainer(io: SocketServer): Container {
  const container = new Container();

  container.bind<SocketServer>(TYPES.SocketServer).toConstantValue(io);
  container.bind<IUserService>(TYPES.IUserService).to(UserService);
  container.bind<IAccountService>(TYPES.IAccountService).to(AccountService);
  container
    .bind<IMiscellaneousService>(TYPES.IMiscellaneousService)
    .to(MiscellaneousService);
  // container.bind<IChatService>(TYPES.IChatService).to(ChatService);
  // container.bind<IGroupService>(TYPES.IGroupService).to(GroupService);
  // container.bind<IMessageService>(TYPES.IMessageService).to(MessageService);

  return container;
}
