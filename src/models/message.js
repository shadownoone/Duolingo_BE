"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Định nghĩa quan hệ ở đây nếu có
      // Ví dụ: Mỗi tin nhắn thuộc về một người dùng (1-n với User)
      Message.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }

  Message.init(
    {
      sender: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Giá trị mặc định là thời gian hiện tại
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // Giá trị mặc định là thời gian hiện tại
      },
    },
    {
      sequelize,
      modelName: "Message",
    }
  );

  return Message;
};
