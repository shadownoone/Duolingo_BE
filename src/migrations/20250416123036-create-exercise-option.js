"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ExerciseOptions", {
      option_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      exercise_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      option_text: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    // Thêm constraint cho exercise_id
    // .then(() => {
    //   return queryInterface.addConstraint("ExerciseOptions", {
    //     fields: ["exercise_id"],
    //     type: "foreign key",
    //     name: "fk_exerciseOptions_exercises",
    //     references: {
    //       table: "Exercises",
    //       field: "exercise_id",
    //     },
    //     onDelete: "CASCADE",
    //     onUpdate: "CASCADE",
    //   });
    // });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ExerciseOptions");
  },
};
