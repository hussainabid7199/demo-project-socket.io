import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";
import MessageModel from "./MessageModel";

class MessageEditModel extends Model {}

MessageEditModel.init(
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
    oldMessage: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    newMessage: {
      type: DataTypes.TEXT,
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
      defaultValue: true,
      allowNull: false,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "MessageEditModel",
    tableName: "message_edits",
  }
);

MessageEditModel.belongsTo(MessageModel, {
  foreignKey: "messageId",
  as: "message",
});

export default MessageEditModel;
