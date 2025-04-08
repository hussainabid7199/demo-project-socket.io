/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mssql",
    dialectOptions: {
      options: {
        // instanceName: 'SQLEXPRESS',
        encrypt: false,
        trustServerCertificate: true,
      },
    },
  },
};

