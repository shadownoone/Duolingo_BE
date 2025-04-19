const userProgressService = require("../services/userProgressService");

const db = require("~/models");
const BaseController = require("./BaseController");

const { Op, fn, col, literal } = require("sequelize");
class UserProgressController extends BaseController {
  constructor() {
    super("userProgress");
  }

  getLeaderboard = async () => {
    // Lấy tổng xp của mỗi user (chỉ tính những lesson đã hoàn thành)
    const rows = await db.UserProgress.findAll({
      where: { status: "completed" },
      attributes: ["user_id", [fn("SUM", col("xp")), "total_xp"]],
      group: ["user_id"],
      order: [[literal("total_xp"), "DESC"]],

      include: [
        {
          model: db.User,
          attributes: ["username", "avatar"], // hoặc các field user của bạn
        },
      ],
    });

    // format lại cho dễ dùng
    return rows.map((r) => ({
      userId: r.user_id,
      username: r.User.username,
      avatar: r.User.avatar,
      totalXp: r.get("total_xp"),
    }));
  };
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

  getByUser = async (req, res) => {
    try {
      const userId = req.user.user_id;
      const progresses = await db.UserProgress.findAll({
        where: { user_id: userId },
        order: [["lesson_id", "ASC"]],
        raw: false,
      });
      return res.status(200).json({ code: 0, data: progresses });
    } catch (error) {
      console.error("getByUser error:", error);
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
