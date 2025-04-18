"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Language extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // src/models/language.js
      Language.hasMany(models.Course, {
        foreignKey: "language_id",
        as: "courses",
      });
      Language.belongsToMany(models.User, {
        through: models.UserLanguage,
        foreignKey: "language_id",
        otherKey: "user_id",
        as: "users",
      });

      Language.hasMany(models.UserLanguage, {
        foreignKey: "language_id",
        as: "userLanguages",
      });

      // define association here
    }
  }
  Language.init(
    {
      language_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      language_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      language_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
    },
    {
      sequelize,
      modelName: "Language",
      tableName: "Languages",
      timestamps: false, // nếu bạn không dùng updatedAt, createdAt mặc định
    }
  );
  return Language;
};
