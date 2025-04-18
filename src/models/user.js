"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Language, {
        through: models.UserLanguage,
        foreignKey: "user_id",
        otherKey: "language_id",
        as: "languages",
      });
    }
  }

  User.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(50),
      },
      last_name: {
        type: DataTypes.STRING(50),
      },
      avatar: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users", // Để khớp với tên bảng trong DB
      timestamps: true, // Nếu bạn muốn dùng createdAt, updatedAt
      createdAt: "created_at", // báo cho Sequelize biết cột DB tên là created_at
      updatedAt: "updated_at", // báo cho Sequelize biết cột DB tên là updated_at
    }
  );

  return User;
};
