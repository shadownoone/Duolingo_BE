const userProgressService = require("../services/userProgressService");

const db = require("~/models");
const BaseController = require("./BaseController");

const { Op, fn, col, literal } = require("sequelize");
class UserProgressController extends BaseController {
  constructor() {
    super("userProgress");
  }

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
      // 1. Tạo hoặc tìm Progress
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

      // 2. Tính lingots được thưởng
      const lingotsDelta = created ? 10 : 3;
      if (!created) {
        progress.status = "completed";
        const currentScore = parseFloat(progress.score) || 0;
        const currentXp = parseFloat(progress.xp) || 0;
        progress.score = currentScore + 5;
        progress.xp = currentXp + 5;
        progress.completed_at = new Date();
        await progress.save();
      }

      // 3. Cộng lingots vào cột `lingots` của Users
      await db.User.increment(
        { lingots: lingotsDelta },
        { where: { user_id: userId } }
      );

      // 4. Lấy số lingots mới trả về client
      const user = await db.User.findByPk(userId, {
        attributes: ["lingots"],
      });

      return res.status(200).json({
        code: 0,
        message: "Lưu tiến độ thành công",
        data: {
          progress,
          lingots_awarded: lingotsDelta,
          lingots: user.lingots,
        },
      });
    } catch (error) {
      console.error("completeLesson error:", error);
      return res.status(500).json({
        code: -1,
        message: error.message,
      });
    }
  };

  getLeaderboard = async (limit = 10) => {
    const rows = await db.UserProgress.findAll({
      where: { status: "completed" },
      attributes: [
        [col("UserProgress.user_id"), "user_id"],
        [fn("SUM", col("UserProgress.xp")), "total_xp"],
      ],
      group: [
        col("UserProgress.user_id"),
        col("User.user_id"),
        col("User.username"),
        col("User.avatar"),
        col("User.created_at"),
        col("User.streak_count"),
        col("User.first_name"),
        col("User.last_name"),
        col("User.last_practice_date"),
        col("User.is_vip"),
      ],
      order: [[literal("total_xp"), "DESC"]],
      limit: limit,
      include: [
        {
          model: db.User,
          attributes: [
            "user_id",
            "username",
            "avatar",
            "created_at",
            "streak_count",
            "first_name",
            "last_name",
            "last_practice_date",
            "is_vip",
          ],
        },
      ],
    });

    return rows.map((r) => ({
      userId: r.get("user_id"),
      username: r.User.username,
      avatar: r.User.avatar,
      createdAt: r.User.created_at,
      streakCount: r.User.streak_count,
      firstName: r.User.first_name,
      lastName: r.User.last_name,
      lastPracticeDate: r.User.last_practice_date,
      isVip: r.User.is_vip,
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
}

module.exports = new UserProgressController();
