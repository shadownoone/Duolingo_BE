"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface
      .createTable("Lessons", {
        lesson_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        course_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        lesson_title: {
          type: Sequelize.STRING(150),
          allowNull: false,
        },
        lesson_order: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      })
      .then(() => {
        // Thêm ràng buộc FOREIGN KEY cho course_id
        return queryInterface.addConstraint("Lessons", {
          fields: ["course_id"],
          type: "foreign key",
          name: "fk_lessons_courses", // Tên constraint (tuỳ ý)
          references: {
            table: "Courses",
            field: "course_id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        });
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Lessons");
  },
};
