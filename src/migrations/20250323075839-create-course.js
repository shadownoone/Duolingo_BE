"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Courses", {
      course_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      language_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      course_name: {
        type: Sequelize.STRING(100),
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
    });
    // .then(() => {
    //   // Thêm ràng buộc FOREIGN KEY cho cột language_id
    //   return queryInterface.addConstraint("Courses", {
    //     fields: ["language_id"],
    //     type: "foreign key",
    //     name: "fk_courses_languages", // Tên constraint, tùy ý bạn
    //     references: {
    //       table: "Languages",
    //       field: "language_id",
    //     },
    //     onDelete: "CASCADE",
    //     onUpdate: "CASCADE",
    //   });
    // });
  },

  async down(queryInterface, Sequelize) {
    // Khi rollback, dropTable sẽ tự động gỡ bỏ constraint
    await queryInterface.dropTable("Courses");
  },
};
