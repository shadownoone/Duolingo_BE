"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // Định nghĩa các method tĩnh hoặc quan hệ (associations) nếu cần
    static associate(models) {
      // ví dụ: this.hasMany(models.Post, { foreignKey: 'userId' });
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
