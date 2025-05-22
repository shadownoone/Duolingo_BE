"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Badge extends Model {
    static associate(models) {
      // Định nghĩa quan hệ nếu cần
    }
  }

  Badge.init(
    {
      badge_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      badge_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      icon_url: {
        type: DataTypes.STRING(255),
      },
      xp_threshold: {
        type: DataTypes.INTEGER,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Badge",
      tableName: "Badges",
      timestamps: false, // Không dùng createdAt, updatedAt mặc định
    }
  );

  return Badge;
};
