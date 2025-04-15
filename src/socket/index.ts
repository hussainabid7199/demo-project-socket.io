/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";
import { Server as SocketIOServer, Socket } from "socket.io";
import { ChatEventEnum } from "./constant";
import CustomError from "../exceptions/custom-error";
import { CurrentUserDto } from "../dtos/UserDto";

export class SocketServer {
  private io!: SocketIOServer;

  public initializeSocketIO(io: SocketIOServer): void {
    this.io = io;

    io.on("connection", async (socket: Socket & { user?: CurrentUserDto }) => {
      try {
        const token: string = socket.handshake.auth?.token || "";

        if (!token) {
          throw new CustomError(
            "Un-authorized handshake. Token is missing",
            401
          );
        }

        const { id, guid, email, fullName } = jwt.verify(
          token,
          process.env.JWT_SECRET!
        ) as CurrentUserDto;

        if (!id || !guid || !email || !fullName) {
          throw new CustomError(
            "Un-authorized handshake. Token is invalid",
            401
          );
        }

        const socketUser: CurrentUserDto = { id, guid, email, fullName };
        socket.user = socketUser as CurrentUserDto;
        socket.join(guid);
        socket.emit(ChatEventEnum.CONNECTED_EVENT);
        console.log("user connected 🗼. user-unique-id: ", guid);

        this.mountJoinChatEvent(socket);
        this.mountParticipantTypingEvent(socket);
        this.mountParticipantStoppedTypingEvent(socket);

        socket.on(ChatEventEnum.DISCONNECT_EVENT, () => {
          console.log("user has disconnected 🚫. user-unique-id: " + socket?.user?.guid);
          if (socket?.user?.guid) {
            socket.leave(socket.user.guid);
          }
        });
      } catch (error) {
        socket.emit(
          ChatEventEnum.SOCKET_ERROR_EVENT,
          error || "Something went wrong while connecting to the socket."
        );
      }
    });
  }

  public emitSocketEvent(
    roomId: string,
    event: ChatEventEnum,
    payload: any
  ): void {
    if (!this.io) {
      throw new Error("Socket server not initialized.");
    }
    this.io.in(roomId).emit(event, payload);
  }

  private mountJoinChatEvent(socket: Socket): void {
    socket.on(ChatEventEnum.JOIN_CHAT_EVENT, (chatId: string) => {
      console.log(`User joined the chat 🤝. chatId: `, chatId);
      socket.join(chatId);
    });
  }

  private mountParticipantTypingEvent(socket: Socket): void {
    socket.on(ChatEventEnum.TYPING_EVENT, (chatId: string) => {
      socket.in(chatId).emit(ChatEventEnum.TYPING_EVENT, chatId);
    });
  }

  private mountParticipantStoppedTypingEvent(socket: Socket): void {
    socket.on(ChatEventEnum.STOP_TYPING_EVENT, (chatId: string) => {
      socket.in(chatId).emit(ChatEventEnum.STOP_TYPING_EVENT, chatId);
    });
  }
}
