"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserBadge extends Model {
    static associate(models) {
      // Định nghĩa quan hệ nếu cần:
      UserBadge.belongsTo(models.User, { foreignKey: "user_id" });
      UserBadge.belongsTo(models.Badge, { foreignKey: "badge_id" });
    }
  }

  UserBadge.init(
    {
      user_badge_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      badge_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      awarded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "UserBadge",
      tableName: "UserBadges",
      timestamps: false, // Không dùng createdAt, updatedAt mặc định
    }
  );

  return UserBadge;
};
