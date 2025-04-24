import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";

class ErrorLoggerModel extends Model {}

ErrorLoggerModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    errorType: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    errorCode: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    requestType: {
      type: DataTypes.TEXT(),
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING(250),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE(7),
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ErrorLoggerModel",
    tableName: "error_loggers",
    timestamps: false,
  }
);

export default ErrorLoggerModel;

// example of error
// {
//   error: error.message,
//   errorType: 'DATABASE_ERROR',
//   errorCode: 'DB001',
// };
