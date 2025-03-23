"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .createTable("Exercises", {
        exercise_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        lesson_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        exercise_type_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        question_content: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        answer: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        hints: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      })
      // Thêm foreign key cho lesson_id
      .then(() => {
        return queryInterface.addConstraint("Exercises", {
          fields: ["lesson_id"],
          type: "foreign key",
          name: "fk_exercises_lessons",
          references: {
            table: "Lessons",
            field: "lesson_id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      })
      // Thêm foreign key cho exercise_type_id
      .then(() => {
        return queryInterface.addConstraint("Exercises", {
          fields: ["exercise_type_id"],
          type: "foreign key",
          name: "fk_exercises_exercisetypes",
          references: {
            table: "ExerciseTypes",
            field: "exercise_type_id",
          },
          onDelete: "RESTRICT", // theo yêu cầu
          onUpdate: "CASCADE",
        });
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Exercises");
  },
};
