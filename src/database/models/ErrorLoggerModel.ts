import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";

class ErrorLoggerModel extends Model {}

ErrorLoggerModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    error: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    errorType: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    errorCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
    tableName: "error-loggers",
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
