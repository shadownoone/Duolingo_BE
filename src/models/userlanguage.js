"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserLanguage extends Model {
    static associate(models) {
      // Mỗi bản ghi UserLanguage thuộc về 1 User
      UserLanguage.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });
      // Mỗi bản ghi UserLanguage thuộc về 1 Language
      UserLanguage.belongsTo(models.Language, {
        foreignKey: "language_id",
        as: "language",
      });
    }
  }
  UserLanguage.init(
    {
      user_language_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      language_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      enrolled_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      sequelize,
      modelName: "UserLanguage",
      tableName: "UserLanguages",
      timestamps: false,
    }
  );
  return UserLanguage;
};
