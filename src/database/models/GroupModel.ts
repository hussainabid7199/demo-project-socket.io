"use strict";
import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";
import UserModel from "./UserModel";

class GroupModel extends Model {}

GroupModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
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
    tableName: "groups",
    modelName: "GroupModel",
    timestamps: false,
  }
);

GroupModel.belongsTo(UserModel, {
  foreignKey: "adminId",
  as: "user",
});

export default GroupModel;
