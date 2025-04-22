import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";
import ChatModel from "./ChatModel";
import UserModel from "./UserModel";

class MessageModel extends Model {}

MessageModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    messageType: {
      type: DataTypes.ENUM("TEXT", "IMAGE", "VIDEO", "AUDIO", "FILE"),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE(7),
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE(7),
      allowNull: true,
    },
    updatedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "messages",
    modelName: "MessageModel",
  }
);

MessageModel.belongsTo(ChatModel, {
  foreignKey: "chatId",
  as: "chats",
});

MessageModel.belongsTo(UserModel, {
  foreignKey: "senderId",
  as: "users",
});

export default MessageModel;
