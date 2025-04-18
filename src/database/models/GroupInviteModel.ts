import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";
import ChatModel from "./ChatModel";
import UserModel from "./UserModel";

class GroupInviteModel extends Model {}

GroupInviteModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    invitedUserId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    invitedBy: {
      type: DataTypes.UUID,
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
