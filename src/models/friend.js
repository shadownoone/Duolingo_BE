"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Friend extends Model {
    static associate(models) {
      Friend.belongsTo(models.User, { foreignKey: "user_id" });
      Friend.belongsTo(models.User, { foreignKey: "friend_user_id" });
    }
  }

  Friend.init(
    {
      friend_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      friend_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: "pending",
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Friend",
      tableName: "Friends",
      timestamps: false, // Tắt createdAt, updatedAt mặc định
    }
  );

  return Friend;
};
