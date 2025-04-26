"use-strict";
import { Container } from "inversify";
import { TYPES } from "./types";
import IUserService from "../services/interface/IUserService";
import IAccountService from "../services/interface/IAccountService";
import IMiscellaneousService from "../services/interface/IMiscellaneousService";

import { SocketServer } from "../socket";
import UserService from "../services/UserService";
import AccountService from "../services/AccountService";
import IChatService from "../services/interface/IChatService";
import ChatService from "../services/ChatService";
import MiscellaneousService from "../services/MiscellaneousService";

export function createContainer(io: SocketServer): Container {
  const container = new Container();

  container.bind<SocketServer>(TYPES.SocketServer).toConstantValue(io);
  container.bind<IUserService>(TYPES.IUserService).to(UserService);
  container.bind<IAccountService>(TYPES.IAccountService).to(AccountService);
  container.bind<IChatService>(TYPES.IChatService).to(ChatService);
  container
  .bind<IMiscellaneousService>(TYPES.IMiscellaneousService)
  .to(MiscellaneousService);

  return container;
}
