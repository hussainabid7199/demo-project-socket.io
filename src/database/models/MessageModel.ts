"use strict";
import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";
import ChatContactModel from "./ChatContactModel";

class MessageModel extends Model {}
MessageModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    chatContactId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    groupMemberId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    currentUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
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
    timestamps: false,
  }
);

MessageModel.belongsTo(ChatContactModel, {
  foreignKey: "chatContactId",
  as: "chat_contacts",
});

export default MessageModel;
