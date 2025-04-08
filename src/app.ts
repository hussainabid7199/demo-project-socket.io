"use-strict";
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
import { TYPES } from "./config/types";

dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV?.trim()}` });

// Sequelize connection path
import sequelize from "./database/connection";

const swaggerPath = path.resolve(process.cwd(), "src", "swagger.yaml");
const swaggerDocument = YAML.load(swaggerPath);
const publicPath = path.join(__dirname, "../public");

import "./controller/controllers";
import { startCluster } from "./utils/load-balancer/cluster";

export async function startServer() {
  const sIO = {} as SocketIOServer;
  const container = createContainer(sIO);
  const inversifyServer = new InversifyExpressServer(container);
  const clientIDMiddleware = new ClientIdMiddleware();

  inversifyServer.setConfig((app) => {
    app.use(
      cors({
        origin: "http://localhost:3000",
        allowedHeaders: "*",
        methods: ["GET", "PUT", "POST", "DELETE", "PATCH"],
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );

    app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    // app.get("/", (req: Request, res: Response) => {
    //   res.sendFile(path.join(publicPath, "index.html"));
    // });
    app.use(clientIDMiddleware.verify);
    app.use(requestIp.mw());
    app.use(limiter);
    app.use(
      session({
        secret: process.env.JWT_SECRET || "",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }, // Set to true if using HTTPS
      })
    );
    app.use(express.static(publicPath));
    app.use(express.json({ limit: "16kb" }));
    app.use(express.urlencoded({ extended: true, limit: "16kb" }));
  });

  inversifyServer.setErrorConfig((app) => {
    app.use((err: Error, req: Request, res: Response) => {
      console.error(err.stack);
      res.status(500).send({ error: err.message, success: false });
    });
  });

  const app = inversifyServer.build();
  const httpServer = http.createServer(app);

  const io = new SocketIOServer(httpServer, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
      allowedHeaders: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  container.rebind<SocketIOServer>(TYPES.SocketIO).toConstantValue(io);

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("connect_error", (err) => {
      console.log(err.message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected with socket id: ", socket.id);
    });
  });

  const port = process.env.PORT || 3002;

  httpServer.listen(port, async () => {
    try {
      await sequelize.authenticate();
      console.log("Database connection successful.");
      console.log(`Server listening at http://localhost:${port}`);
    } catch (error) {
      console.error("Error during server startup:", error);
      httpServer.close(() => {
        console.log("Server shut down due to DB connection failure.");
        process.exit(1);
      });
    }
  });

  process.on("SIGTERM", () => {
    console.log(`🛑 Worker ${process.pid} is shutting down`);
    httpServer.close(() => process.exit(0));
  });
}

// startServer()
startCluster(startServer);
