const userProgressService = require("../services/userProgressService");

const db = require("~/models");
const BaseController = require("./BaseController");

class UserProgressController extends BaseController {
  constructor() {
    super("userProgress");
  }

  // GET API
  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    try {
      const data = await userProgressService.find({
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

  completeLesson = async (req, res) => {
    const userId = req.user.user_id;
    const { lesson_id } = req.body;

    if (!lesson_id) {
      return res.status(400).json({
        code: -1,
        message: "lesson_id is required",
      });
    }

    try {
      // Tìm hoặc tạo record
      const [progress, created] = await db.UserProgress.findOrCreate({
        where: { user_id: userId, lesson_id },
        defaults: {
          user_id: userId,
          lesson_id,
          status: "completed",
          score: 10,
          xp: 10,
          started_at: new Date(),
          completed_at: new Date(),
        },
      });

      // Nếu đã có rồi, chỉ cần update status + completed_at
      if (!created) {
        progress.status = "completed";
        const currentScore = parseFloat(progress.score) || 0;
        const currentXp = parseFloat(progress.xp) || 0;
        progress.score = currentScore + 5;
        progress.xp = currentXp + 5;
        progress.completed_at = new Date();
        await progress.save();
      }

      return res.status(200).json({
        code: 0,
        message: "Lưu tiến độ thành công",
        data: progress,
      });
    } catch (error) {
      console.error("completeLesson error:", error);
      return res.status(500).json({
        code: -1,
        message: error.message,
      });
    }
  };
}

module.exports = new UserProgressController();
