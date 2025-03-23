"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .createTable("UserProgresses", {
        progress_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        lesson_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: "not_started",
        },
        // Chỉnh lại kiểu DECIMAL(5,2)
        score: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: false,
          defaultValue: 0.0,
        },
        xp: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        started_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        completed_at: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      })
      .then(() => {
        // Thêm ràng buộc khóa ngoại cho user_id
        return queryInterface.addConstraint("UserProgresses", {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_userprogresses_users",
          references: {
            table: "Users",
            field: "user_id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      })
      .then(() => {
        // Thêm ràng buộc khóa ngoại cho lesson_id
        return queryInterface.addConstraint("UserProgresses", {
          fields: ["lesson_id"],
          type: "foreign key",
          name: "fk_userprogresses_lessons",
          references: {
            table: "Lessons",
            field: "lesson_id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      })
      .then(() => {
        // Thêm UNIQUE KEY (user_id, lesson_id)
        return queryInterface.addConstraint("UserProgresses", {
          fields: ["user_id", "lesson_id"],
          type: "unique",
          name: "unique_user_lesson",
        });
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("UserProgresses");
  },
};
