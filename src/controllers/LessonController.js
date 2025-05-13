const lessonService = require("../services/lessonService");
const db = require("~/models");
const slugify = require("slugify");
const BaseController = require("./BaseController");

class LessonController extends BaseController {
  constructor() {
    super("lesson");
  }

  getLessByCourse = async (req, res) => {
    try {
      const { courseId } = req.params;
      const lesson = await db.Course.findOne({
        where: { course_id: courseId },
        include: [
          {
            model: db.Lesson,
          },
        ],
      });
      if (!lesson) {
        return res.status(404).json({ code: -1, message: "lesson not found" });
      }
      return res.status(200).json({
        code: 0,
        message: "ok",
        data: lesson,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ code: -1, message: error.message });
    }
  };

  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 50;
    try {
      const data = await lessonService.find({
        page: page,
        pageSize: pageSize,

        raw: false,
      });

      if (data.code === -1) {
        return res.status(500).json(data);
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ code: -1, message: error.message });
    }
  };

  getLessonDetail = async (req, res) => {
    try {
      const { lessonId } = req.params;

      const lesson = await db.Lesson.findOne({
        where: { lesson_id: lessonId },

        include: [
          {
            model: db.Course,

            attributes: ["language_id"],
          },
          {
            model: db.Exercise,
            as: "exercises",
            include: [
              {
                model: db.ExerciseType,
                as: "exerciseType",
              },
              {
                model: db.ExerciseOption,
                as: "options",
              },
            ],
          },
        ],
      });

      if (!lesson) {
        return res
          .status(404)
          .json({ code: -1, message: "Bài học không tồn tại" });
      }

      return res.status(200).json({
        code: 0,
        message: "ok",
        data: lesson,
      });
    } catch (error) {
      console.error("getLessonDetail error:", error);
      return res.status(500).json({ code: -1, message: error.message });
    }
  };

  create = async (req, res) => {
    const { course_id, lesson_title, lesson_order, content, type } = req.body;
    if (!course_id || !lesson_title || !lesson_order) {
      return res.status(400).json({
        message:
          "Missing required fields: course_id, lesson_title, lesson_order",
      });
    }
    try {
      const newLesson = await db.Lesson.create({
        course_id,
        lesson_title,
        lesson_order,
        content,
        type,
      });
      res.status(201).json({
        message: "Lesson created successfully",
        data: newLesson,
      });
    } catch (error) {
      console.error("Error creating Lesson:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  update = async (req, res) => {
    const { lessonId } = req.params;
    const { lesson_title, lesson_order, content, type } = req.body;

    try {
      const lesson = await db.Lesson.findByPk(lessonId);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }

      const updatedLesson = await lesson.update({
        lesson_title: lesson_title || lesson.lesson_title,
        lesson_order: lesson_order || lesson.lesson_order,
        content: content || lesson.content,
        type: type || lesson.type,
      });

      return res.status(200).json({
        message: "Lesson updated successfully",
        data: updatedLesson,
      });
    } catch (error) {
      console.error("Error updating Lesson:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  delete = async (req, res) => {
    try {
      const lesson_id = req.params.lesson_id;
      console.log(lesson_id);

      await lessonService.delete({
        where: { lesson_id: lesson_id },
      });

      return res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (error) {
      console.error("Error deleting Lesson:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
}

module.exports = new LessonController();
