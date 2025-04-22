import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";
import MessageModel from "./MessageModel";
import UserModel from "./UserModel";

class MessageDeleteModel extends Model {}

MessageDeleteModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    deletedBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE(7),
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
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
    modelName: "MessageDeleteModel",
    tableName: "message_deletes",
  }
);

MessageDeleteModel.belongsTo(MessageModel, {
  foreignKey: "messageId",
  as: "messages",
});

MessageDeleteModel.belongsTo(UserModel, {
  foreignKey: "deletedBy",
  as: "users",
});

export default MessageDeleteModel;
