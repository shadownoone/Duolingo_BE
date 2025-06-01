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
      User.hasMany(models.Payment, {
        foreignKey: "user_id",
        as: "payments",
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

      last_practice_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      streak_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      hearts_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
      },

      lingots: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      role: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      is_vip: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return User;
};
