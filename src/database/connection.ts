"use strict";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import { dbConnectionConfiguration } from "./configuration";

dotenv.config();
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });


const env = process.env.NODE_ENV?.trim() || "local";

const db = () => {
  if (env && env == "local") {
    return dbConnectionConfiguration.local;
  } else if (env && env == "development") {
    return dbConnectionConfiguration.development;
  } else if (env && env == "production") {
    return dbConnectionConfiguration.production;
  }
};

const configuration = db();
if(!configuration?.database || !configuration.username || !configuration.password || !configuration.config)
  throw Error("Invalid database credentials.")


const sequelize = new Sequelize(
  configuration?.database || "",
  configuration?.username || "",
  configuration?.password || "",
  configuration?.config
);

console.log(`Connecting to ${configuration?.database} database on port ${configuration?.config.port}...`);

export default sequelize;


