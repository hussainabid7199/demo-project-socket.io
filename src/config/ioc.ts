"use-strict";
import { Container } from "inversify";
import { TYPES } from "./types";
import { Server as SocketIOServer } from "socket.io";

import IUserService from "../services/interface/IUserService";
import IAccountService from "../services/interface/IAccountService";
import IChatService from "../services/interface/IChatService";
import IGroupService from "../services/interface/IGroupService";
import IMiscellaneousService from "../services/interface/IMiscellaneousService";

import UserService from "../services/UserService";
import AccountService from "../services/AccountService";
import ChatService from "../services/ChatService";
import GroupService from "../services/GroupService";
import MiscellaneousService from "../services/MiscellaneousService";


export function createContainer(io: SocketIOServer): Container {

const container = new Container();

container.bind<SocketIOServer>(TYPES.SocketIO).toConstantValue(io);
container.bind<IUserService>(TYPES.IUserService).to(UserService);
container.bind<IAccountService>(TYPES.IAccountService).to(AccountService);
container.bind<IMiscellaneousService>(TYPES.IMiscellaneousService).to(MiscellaneousService);
container.bind<IChatService>(TYPES.IChatService).to(ChatService);
container.bind<IGroupService>(TYPES.IGroupService).to(GroupService);


 return container; 
}
