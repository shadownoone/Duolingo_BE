const userBadgeService = require("../services/userBadgeService");
const db = require("~/models");
const BaseController = require("./BaseController");

class UserBadgeController extends BaseController {
  constructor() {
    super("userBadge");
  }

  // GET API
  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    try {
      const data = await userBadgeService.find({
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

  assign = async (req, res) => {
    // lấy user_id từ middleware authenticateUser
    const userId = req.user.user_id;
    // badge_id từ body
    const { badge_id } = req.body;

    try {
      // 1️⃣ Kiểm tra badge có tồn tại không
      const badge = await db.Badge.findByPk(badge_id);
      if (!badge) {
        return res.status(404).json({
          code: -1,
          message: "Badge không tồn tại",
        });
      }

      // 2️⃣ Tính tổng XP của user (sum trên UserProgress)
      const totalXp =
        (await db.UserProgress.sum("xp", {
          where: { user_id: userId },
        })) || 0;

      // 3️⃣ Kiểm tra điều kiện XP
      if (totalXp < badge.xp_threshold) {
        return res.status(400).json({
          code: -1,
          message: `Chưa đủ XP (${totalXp} < ${badge.xp_threshold}) để nhận huy chương này`,
        });
      }

      // 4️⃣ Kiểm tra xem user đã có badge chưa
      const existed = await db.UserBadge.findOne({
        where: { user_id: userId, badge_id },
      });
      if (existed) {
        return res.status(400).json({
          code: -1,
          message: "Bạn đã nhận huy chương này rồi",
        });
      }

      // 5️⃣ Tạo mới record trong UserBadge
      const userBadge = await db.UserBadge.create({
        user_id: userId,
        badge_id: badge_id,
      });

      // 6️⃣ Trả về kết quả
      return res.status(200).json({
        code: 0,
        message: "Đã cấp huy chương thành công",
        data: userBadge,
      });
    } catch (error) {
      console.error("Assign badge error:", error);
      return res.status(500).json({
        code: -1,
        message: error.message,
      });
    }
  };
}

module.exports = new UserBadgeController();
