"use strict";
const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  class ExerciseOption extends Model {
    static associate(models) {
      // Mỗi ExerciseOption thuộc về 1 Exercise
      ExerciseOption.belongsTo(models.Exercise, {
        foreignKey: "exercise_id",
        as: "exercise",
      });
    }
  }
  ExerciseOption.init(
    {
      id: {
        // Đặt tên attribute là "id" để Sequelize tự động sử dụng
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        field: "option_id", // ánh xạ thuộc tính id sang cột option_id trong DB
      },
      exercise_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      option_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      modelName: "ExerciseOption",
      tableName: "ExerciseOptions",
      timestamps: false, // Tắt tạo createdAt, updatedAt tự động
    }
  );
  return ExerciseOption;
};
