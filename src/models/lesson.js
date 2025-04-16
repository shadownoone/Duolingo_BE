"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Lesson extends Model {
    // Định nghĩa các associations (quan hệ) nếu cần
    static associate(models) {
      Lesson.belongsTo(models.Course, { foreignKey: "course_id" });
      Lesson.hasMany(models.Exercise, {
        foreignKey: "lesson_id",
        as: "exercises",
      });
    }
  }

  Lesson.init(
    {
      lesson_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      lesson_title: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      lesson_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Lesson", // Tên model (thường PascalCase)
      tableName: "Lessons", // Tên bảng trong DB
      timestamps: false, // Không dùng createdAt, updatedAt mặc định của Sequelize
      // Nếu bạn muốn map cột createdAt của Sequelize sang created_at
      // thì có thể dùng:
      createdAt: "created_at",
      // updatedAt: false
    }
  );

  return Lesson;
};
