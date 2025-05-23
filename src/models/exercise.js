"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Exercise extends Model {
    static associate(models) {
      // Nếu muốn, bạn có thể khai báo quan hệ:
      Exercise.belongsTo(models.Lesson, {
        foreignKey: "lesson_id",
        as: "lesson",
      });

      Exercise.belongsTo(models.ExerciseType, {
        foreignKey: "exercise_type_id",
        as: "exerciseType",
      });
      Exercise.hasMany(models.ExerciseOption, {
        foreignKey: "exercise_id",
        as: "options",
      });
    }
  }

  Exercise.init(
    {
      exercise_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      exercise_type_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question_content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      hints: {
        type: DataTypes.TEXT,
      },
      audio_url: {
        type: DataTypes.STRING,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Exercise",
      tableName: "Exercises",
      timestamps: false, // Tắt createdAt, updatedAt mặc định
    }
  );

  return Exercise;
};
