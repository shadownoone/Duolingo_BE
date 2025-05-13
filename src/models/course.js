"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    // Định nghĩa các associations (quan hệ) nếu cần
    static associate(models) {
      Course.belongsTo(models.Language, { foreignKey: "language_id" });
      Course.hasMany(models.Lesson, { foreignKey: "course_id" });
    }
  }

  Course.init(
    {
      course_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      language_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      course_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
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
      modelName: "Course", // Tên model (thường PascalCase)
      tableName: "Courses", // Tên bảng trong DB
      timestamps: false, // Vì bạn không có updated_at
    }
  );

  return Course;
};
