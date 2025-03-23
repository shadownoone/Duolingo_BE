"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .createTable("UserBadges", {
        user_badge_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        badge_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        awarded_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      })
      // Thêm FOREIGN KEY cho user_id
      .then(() => {
        return queryInterface.addConstraint("UserBadges", {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_userbadges_users",
          references: {
            table: "Users",
            field: "user_id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      })
      // Thêm FOREIGN KEY cho badge_id
      .then(() => {
        return queryInterface.addConstraint("UserBadges", {
          fields: ["badge_id"],
          type: "foreign key",
          name: "fk_userbadges_badges",
          references: {
            table: "Badges",
            field: "badge_id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      })
      // Thêm UNIQUE KEY (user_id, badge_id)
      .then(() => {
        return queryInterface.addConstraint("UserBadges", {
          fields: ["user_id", "badge_id"],
          type: "unique",
          name: "unique_user_badge",
        });
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserBadges");
  },
};
