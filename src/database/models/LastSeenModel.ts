import { DataTypes, Model } from "sequelize";
import sequelize from "../connection";
import UserModel from "./UserModel";

class LastSeenOnModel extends Model {}

LastSeenOnModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    lastSeenOn: {
      type: DataTypes.DATE(7),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE(7),
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE(7),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "LastSeenOnModel",
    tableName: "last_seen_ons",
  }
);

LastSeenOnModel.belongsTo(UserModel, {
  foreignKey: "userId",
  as: "users",
});
