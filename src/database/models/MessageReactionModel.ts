import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";
import MessageModel from "./MessageModel";
import UserModel from "./UserModel";

class MessageReactionModel extends Model {}

MessageReactionModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    emoji: {
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
    modelName: "MessageReactionModel",
    tableName: "message_reactions",
  }
);

MessageReactionModel.belongsTo(MessageModel, {
  foreignKey: "messageId",
  as: "messages",
});

MessageReactionModel.belongsTo(UserModel, {
  foreignKey: "userId",
  as: "users",
});

export default MessageReactionModel;
