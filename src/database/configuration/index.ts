"use strict";
import dotenv from "dotenv";
import { Dialect } from "sequelize";

dotenv.config();

const dbConnectionConfiguration = {
  local: {
    database: process.env.DB_NAME || "",
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    config: {
      host: process.env.DB_HOST,
      dialect: "mssql" as Dialect,
      port: Number(process.env.DB_PORT),
      dialectOptions: {
        options: {
          instanceName: 'SQLEXPRESS',
          encrypt: false,
          trustServerCertificate: true,
        },
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
  },
  development: {
    database: process.env.DB_NAME || "",
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    config: {
      host: process.env.DB_HOST,
      dialect: "mssql" as Dialect,
      port: Number(process.env.DB_PORT),
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
  },
  production: {
    database: process.env.DB_NAME || "",
    username: process.env.DB_USERNAME || "",
    password: process.env.DB_PASSWORD || "",
    config: {
      host: process.env.DB_HOST,
      dialect: "mssql" as Dialect,
      port: Number(process.env.DB_PORT),
      dialectOptions: {
        options: {
          encrypt: false,
          trustServerCertificate: true,
        },
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
  },
};

export { dbConnectionConfiguration };