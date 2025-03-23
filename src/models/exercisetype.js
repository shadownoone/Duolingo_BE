"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ExerciseType extends Model {
    static associate(models) {
      // Nếu có associations, khai báo ở đây
    }
  }

  ExerciseType.init(
    {
      exercise_type_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      exercise_type_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: "ExerciseType",
      tableName: "ExerciseTypes",
      timestamps: false, // Không có createdAt, updatedAt
    }
  );
  return ExerciseType;
};
