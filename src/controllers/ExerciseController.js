const exerciseService = require("../services/exerciseService");
const db = require("~/models");
const BaseController = require("./BaseController");
const { uploadMedia } = require("~/utils/uploadImage");

class ExerciseController extends BaseController {
  constructor() {
    super("exercise");
  }

  // GET API
  getExerciseByLesson = async (req, res) => {
    try {
      const { lessonId } = req.params;
      const exercise = await db.Lesson.findOne({
        where: { lesson_id: lessonId },
        include: [
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
      if (!exercise) {
        return res
          .status(404)
          .json({ code: -1, message: "exercise not found" });
      }
      return res.status(200).json({
        code: 0,
        message: "ok",
        data: exercise,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ code: -1, message: error.message });
    }
  };

  create = async (req, res) => {
    try {
      // 1. Lấy dữ liệu từ body
      const {
        lesson_id,
        exercise_type_id,
        question_content,
        answer,
        hints = "",
        options = [], // mảng { option_text, is_correct }
      } = req.body;

      let mediaUrl = null;
      if (req.files?.media) {
        try {
          mediaUrl = await uploadMedia(req.files.media.tempFilePath);
        } catch (err) {
          console.error("uploadMedia error:", err);
          return res
            .status(500)
            .json({ message: "Upload thất bại", detail: err.message });
        }
      }

      // 2. Validate
      if (!lesson_id) {
        return res.status(400).json({ message: "lesson_id is required" });
      }
      if (!exercise_type_id) {
        return res
          .status(400)
          .json({ message: "exercise_type_id is required" });
      }
      if (!question_content) {
        return res
          .status(400)
          .json({ message: "question_content is required" });
      }
      if (!answer) {
        return res.status(400).json({ message: "answer is required" });
      }

      // 3. Kiểm tra trùng (optional)
      const existed = await db.Exercise.findOne({
        where: { lesson_id, question_content },
      });
      if (existed) {
        return res.status(400).json({
          message:
            "An exercise with the same question already exists in this lesson",
        });
      }

      // 4. Tạo bản ghi Exercise
      const newExercise = await db.Exercise.create({
        lesson_id,
        exercise_type_id,
        question_content,
        answer,
        hints,
        audio_url: mediaUrl,
      });

      // 5. Tạo các options (nếu có)
      if (Array.isArray(options) && options.length) {
        const opts = options.map((o) => ({
          exercise_id: newExercise.exercise_id,
          option_text: o.option_text,
          is_correct: o.is_correct === true,
        }));
        await db.ExerciseOption.bulkCreate(opts);
      }

      // 6. Query lại để trả về đầy đủ exerciseType + options
      const created = await db.Exercise.findOne({
        where: { exercise_id: newExercise.exercise_id },
        include: [
          { model: db.ExerciseType, as: "exerciseType" },
          { model: db.ExerciseOption, as: "options" },
        ],
      });

      // 7. Trả về client
      return res.status(201).json({
        message: "Exercise created successfully",
        data: created,
      });
    } catch (error) {
      console.error("Error creating exercise:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };

  update = async (req, res) => {
    const { exercise_id } = req.params;
    const {
      lesson_id,
      exercise_type_id,
      question_content,
      answer,
      hints = "",
      options = [], // mảng { option_text, is_correct }
    } = req.body;

    // transaction để đảm bảo atomic
    const t = await db.sequelize.transaction();
    try {
      // 1. Tìm exercise
      const exercise = await db.Exercise.findByPk(exercise_id, {
        transaction: t,
      });
      if (!exercise) {
        await t.rollback();
        return res.status(404).json({ message: "Exercise not found" });
      }

      // 2. Validate (nếu cần)
      if (lesson_id == null) {
        await t.rollback();
        return res.status(400).json({ message: "lesson_id is required" });
      }
      if (exercise_type_id == null) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "exercise_type_id is required" });
      }
      if (!question_content) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "question_content is required" });
      }
      if (!answer) {
        await t.rollback();
        return res.status(400).json({ message: "answer is required" });
      }

      // 3. Update exercise
      await exercise.update(
        {
          lesson_id,
          exercise_type_id,
          question_content,
          answer,
          hints,
        },
        { transaction: t }
      );

      // 4. Xóa options cũ
      await db.ExerciseOption.destroy({
        where: { exercise_id },
        transaction: t,
      });

      // 5. Tạo lại options mới nếu có
      if (Array.isArray(options) && options.length) {
        const opts = options.map((o) => ({
          exercise_id: parseInt(exercise_id, 10),
          option_text: o.option_text,
          is_correct: o.is_correct === true,
        }));
        await db.ExerciseOption.bulkCreate(opts, { transaction: t });
      }

      // 6. Commit
      await t.commit();

      // 7. Lấy lại bản ghi đầy đủ để trả về
      const updated = await db.Exercise.findByPk(exercise_id, {
        include: [
          { model: db.ExerciseType, as: "exerciseType" },
          { model: db.ExerciseOption, as: "options" },
        ],
      });

      return res.status(200).json({
        message: "Exercise updated successfully",
        data: updated,
      });
    } catch (error) {
      await t.rollback();
      console.error("Error updating exercise:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };

  delete = async (req, res) => {
    const { exercise_id } = req.params;
    try {
      const exercise = await db.Exercise.findByPk(exercise_id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }

      await exercise.destroy();

      return res.status(200).json({
        message: "Exercise deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting exercise:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
}

module.exports = new ExerciseController();
