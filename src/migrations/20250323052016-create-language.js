"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Languages", {
      language_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      language_code: {
        type: Sequelize.STRING(10),
        allowNull: false,
        unique: true,
      },
      language_name: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      // Bỏ updatedAt nếu bạn không muốn
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Languages");
  },
};
