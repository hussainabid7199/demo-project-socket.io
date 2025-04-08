"use strict";
import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";
import GroupModel from "./GroupModel";
import UserModel from "./UserModel";

class GroupMemberModel extends Model {}

GroupMemberModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    memberId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
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
    tableName: "group_members",
    modelName: "GroupMemberModel",
    timestamps: false,
  }
);

GroupMemberModel.belongsTo(GroupModel, {
  foreignKey: "groupId",
  as: "groups",
});

GroupMemberModel.belongsTo(UserModel, {
  foreignKey: "memberId",
  as: "user",
});

export default GroupMemberModel;
