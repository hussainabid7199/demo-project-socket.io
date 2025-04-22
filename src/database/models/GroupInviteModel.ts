import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";
import ChatModel from "./ChatModel";
import UserModel from "./UserModel";

class GroupInviteModel extends Model {}

GroupInviteModel.init(
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
    invitedUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    invitedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "ACCEPTED", "DECLINED"),
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
    modelName: "GroupInviteModel",
    tableName: "group_invites",
  }
);

GroupInviteModel.belongsTo(ChatModel, {
  foreignKey: "chatId",
  as: "chats",
});

GroupInviteModel.belongsTo(UserModel, {
  foreignKey: "invitedUserId",
  as: "users",
});
