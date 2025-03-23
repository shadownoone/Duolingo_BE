"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UserProgress extends Model {
    static associate(models) {
      // Nếu cần associations:
      UserProgress.belongsTo(models.User, { foreignKey: "user_id" });
      UserProgress.belongsTo(models.Lesson, { foreignKey: "lesson_id" });
    }
  }

  UserProgress.init(
    {
      progress_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: "not_started",
      },
      score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 0.0,
      },
      xp: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      started_at: {
        type: DataTypes.DATE,
      },
      completed_at: {
        type: DataTypes.DATE,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW, // Hoặc để null vì ta dùng DB auto update
      },
    },
    {
      sequelize,
      modelName: "UserProgress",
      tableName: "UserProgress", // Hoặc 'UserProgress'
      timestamps: false, // Không dùng createdAt/updatedAt mặc định
    }
  );

  return UserProgress;
};
