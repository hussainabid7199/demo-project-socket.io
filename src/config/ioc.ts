"use-strict";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Server as SocketIOServer } from "socket.io";

import IUserService from "../services/interface/IUserService";
import IAccountService from "../services/interface/IAccountService";
import IChatService from "../services/interface/IChatService";

import UserService from "../services/UserService";
import AccountService from "../services/AccountService";
import ChatService from "../services/ChatService";

export function createContainer(io: SocketIOServer): Container {

const container = new Container();

container.bind<SocketIOServer>(TYPES.SocketIO).toConstantValue(io);
container.bind<IChatService>(TYPES.IChatService).to(ChatService);
container.bind<IUserService>(TYPES.IUserService).to(UserService);
container.bind<IAccountService>(TYPES.IAccountService).to(AccountService);


 return container; 
}
