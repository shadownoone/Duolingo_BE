"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up(queryInterface, Sequelize) {
    return queryInterface.createTable("UserLanguages", {
      user_language_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      language_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      enrolled_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    // .then(() => {
    //   // FK: user_id -> Users(user_id)
    //   return queryInterface.addConstraint("UserLanguages", {
    //     fields: ["user_id"],
    //     type: "foreign key",
    //     name: "fk_userlanguages_users",
    //     references: {
    //       table: "Users",
    //       field: "user_id",
    //     },
    //     onDelete: "CASCADE",
    //     onUpdate: "CASCADE",
    //   });
    // })
    // .then(() => {
    //   // FK: language_id -> Languages(language_id)
    //   return queryInterface.addConstraint("UserLanguages", {
    //     fields: ["language_id"],
    //     type: "foreign key",
    //     name: "fk_userlanguages_languages",
    //     references: {
    //       table: "Languages",
    //       field: "language_id",
    //     },
    //     onDelete: "CASCADE",
    //     onUpdate: "CASCADE",
    //   });
    // })
    // .then(() => {
    //   // Unique key: mỗi cặp (user_id, language_id) chỉ tồn tại một lần
    //   return queryInterface.addConstraint("UserLanguages", {
    //     fields: ["user_id", "language_id"],
    //     type: "unique",
    //     name: "unique_user_language",
    //   });
    // });
  },

  down(queryInterface, Sequelize) {
    return queryInterface.dropTable("UserLanguages");
  },
};
