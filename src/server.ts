"use strict";
import "reflect-metadata";
import express, { Request, Response } from "express";
import session from "express-session";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import http from "http";
import requestIp from "request-ip";
import limiter from "./helpers/limiter";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { Server as SocketIOServer } from "socket.io";
import ClientIdMiddleware from "./middleware/clientid.middleware";
import { InversifyExpressServer } from "inversify-express-utils";
import { createContainer } from "./config/ioc";
import sequelize from "./database/connection";
import "./controller/controllers";
import CurrentUserContext from "./middleware/current-user-middleware";
import { SocketServer } from "./socket";

dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV?.trim()}` });
const PORT = process.env.PORT || 9000;
const swaggerPath = path.resolve(process.cwd(), "src", "swagger.yaml");
const swaggerDocument = YAML.load(swaggerPath);
const publicPath = path.join(__dirname, "../public");

export async function startServer(): Promise<void> {
  const httpServer = http.createServer();
  const socketServer = new SocketServer();
  const io = new SocketIOServer(httpServer, {
    pingTimeout: 60000,
    cors: {
      origin: ["http://localhost:3000"],
      allowedHeaders: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  socketServer.initializeSocketIO(io);
  const container = createContainer(socketServer);
  const inversifyServer = new InversifyExpressServer(container);
  const clientIDMiddleware = new ClientIdMiddleware();

  inversifyServer.setConfig((app) => {
    app.use(
      cors({
        origin: ["http://localhost:3000"],
        allowedHeaders: "*",
        methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );
    app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use(clientIDMiddleware.verify);
    app.use(requestIp.mw());
    app.use(limiter);
    app.use(
      session({
        secret: process.env.JWT_SECRET || "",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true },
      })
    );
    app.use(express.static(publicPath));
    app.use(express.json({ limit: "16kb" }));
    app.use(express.urlencoded({ extended: true, limit: "16kb" }));
    app.use(CurrentUserContext);
    app.set("io", io);
    app.get("/health", (req: Request, res: Response) => {
      res.status(200).send({
        success: true,
        message: "Server is healthy!",
      });
    });
    app.use((req, res, next) => {
      console.log(`📥 ${req.method} ${req.url} | 🔊 Port: ${PORT} | 👷 PID: ${process.pid}`);
      next();
    });
  });

  inversifyServer.setErrorConfig((app) => {
    app.use((err: Error, req: Request, res: Response) => {
      console.error(err.stack);
      res.status(500).send({ error: err.message, success: false });
    });
  });

  const server = inversifyServer.build();
  httpServer.on("request", server);
  const port = parseInt(process.env.PORT || "3001", 10);
  httpServer.listen(port, async () => {
    try {
      await sequelize.authenticate();
      const processMemoryStats = process.memoryUsage();
      console.table({
        "Database Status": "✅ Connected successfully",
        "Worker Info": `🛠️ Worker PID ${process.pid}`,
        "Listening On": `🌐 http://localhost:${port}`,
        "processMemoryStats": processMemoryStats
      });
    } catch (error) {
      console.error("Error during server startup:", error);
      httpServer.close(() => {
        console.log("Server shut down due to DB connection failure.");
        process.exit(1);
      });
    }
  });

  process.on("SIGTERM", () => {
    console.log(`Worker ${process.pid} is shutting down`);
    httpServer.close(() => process.exit(0));
  });
}
