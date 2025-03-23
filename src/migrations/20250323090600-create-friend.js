"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .createTable("Friends", {
        friend_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        friend_user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: "pending",
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      })
      .then(() => {
        // Khóa ngoại: user_id -> Users(user_id)
        return queryInterface.addConstraint("Friends", {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_friends_users_1",
          references: {
            table: "Users",
            field: "user_id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      })
      .then(() => {
        // Khóa ngoại: friend_user_id -> Users(user_id)
        return queryInterface.addConstraint("Friends", {
          fields: ["friend_user_id"],
          type: "foreign key",
          name: "fk_friends_users_2",
          references: {
            table: "Users",
            field: "user_id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      })
      .then(() => {
        // UNIQUE KEY (user_id, friend_user_id)
        return queryInterface.addConstraint("Friends", {
          fields: ["user_id", "friend_user_id"],
          type: "unique",
          name: "unique_friendship",
        });
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Friends");
  },
};
