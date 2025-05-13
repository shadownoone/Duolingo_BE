const userService = require("../services/userService");
const BaseController = require("./BaseController");
const db = require("~/models");

class UserController extends BaseController {
  constructor() {
    super("user");
  }

  updateHeart = async (req, res) => {
    const { userId, heartsCount } = req.body;
    if (!userId || heartsCount === undefined) {
      return res.status(400).json({ error: "Missing data" });
    }

    try {
      // Cập nhật số lượng trái tim trong database
      await db.User.update(
        { hearts_count: heartsCount },
        { where: { user_id: userId } }
      );
      res.status(200).json({ message: "Hearts count updated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to update hearts count" });
    }
  };

  purchaseHeart = async (req, res) => {
    const userId = req.user.user_id;
    const heartPrice = 10;
    const quantity = req.body.quantity || 1;
    const cost = heartPrice * quantity;
    const maxHearts = 5;

    try {
      // Lấy user để check số lingots
      const user = await db.User.findByPk(userId, {
        attributes: ["lingots", "hearts_count"],
      });
      if (!user) {
        return res.status(404).json({ code: -1, message: "User not found" });
      }

      if (user.hearts_count + quantity > maxHearts) {
        return res.status(400).json({
          code: -1,
          message: `Cannot have more than ${maxHearts} hearts`,
        });
      }

      if (user.lingots < cost) {
        return res
          .status(400)
          .json({ code: -1, message: "Not enough lingots" });
      }

      // Dùng transaction để đảm bảo atomic
      await db.sequelize.transaction(async (t) => {
        // cộng hearts_count
        await db.User.increment(
          { hearts_count: quantity },
          { where: { user_id: userId }, transaction: t }
        );
        // trừ lingots
        await db.User.decrement(
          { lingots: cost },
          { where: { user_id: userId }, transaction: t }
        );
      });

      // Lấy lại thông tin mới
      const updated = await db.User.findByPk(userId, {
        attributes: ["lingots", "hearts_count"],
      });

      return res.status(200).json({
        code: 0,
        message: "Purchased heart(s) successfully",
        data: {
          hearts_count: updated.hearts_count,
          lingots: updated.lingots,
        },
      });
    } catch (error) {
      console.error("purchaseHeart error:", error);
      return res.status(500).json({
        code: -1,
        message: "Failed to purchase hearts",
      });
    }
  };

  recordPractice = async (req, res) => {
    const userId = req.user.user_id;
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const user = await db.User.findByPk(userId);

    let newStreak;
    if (!user.last_practice_date) {
      // lần đầu tiên
      newStreak = 1;
    } else {
      const last = new Date(user.last_practice_date);
      last.setHours(0, 0, 0, 0);

      const diffDays = (today - last) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        // của hôm qua → tiếp tục streak
        newStreak = user.streak_count + 1;
      } else if (diffDays === 0) {
        // đã practice hôm nay rồi → giữ nguyên
        newStreak = user.streak_count;
      } else {
        // cách hôm qua > 1 ngày → reset về 1
        newStreak = 1;
      }
    }
    user.streak_count = newStreak;
    user.last_practice_date = today;
    await user.save();

    return res.json({
      code: 0,
      message: "Practice recorded",
      data: {
        streakCount: newStreak,
        lastPracticeDate: user.last_practice_date,
      },
    });
  };

  addLanguage = async (req, res) => {
    const userId = req.user.user_id;
    const { language_id } = req.body;

    if (!language_id) {
      return res.status(400).json({
        code: -1,
        message: "language_id is required",
      });
    }

    try {
      const exists = await db.UserLanguage.findOne({
        where: { user_id: userId, language_id },
      });
      if (exists) {
        return res.status(409).json({
          code: -1,
          message: "Language already enrolled",
        });
      }

      const entry = await db.UserLanguage.create({
        user_id: userId,
        language_id,
        enrolled_at: new Date(),
      });

      return res.status(201).json({
        code: 0,
        message: "Language enrolled successfully",
        data: entry,
      });
    } catch (error) {
      console.error("addLanguage error:", error);
      return res.status(500).json({
        code: -1,
        message: error.message,
      });
    }
  };

  getLanguages = async (req, res) => {
    const userId = req.user.user_id;
    try {
      const data = await db.UserLanguage.findAll({
        where: { user_id: userId },
        attributes: ["language_id", "enrolled_at"],
        include: [
          {
            model: db.Language,
            as: "language",
          },
        ],
        order: [["enrolled_at", "DESC"]],
      });

      return res.json({ code: 0, message: "Fetched user languages", data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ code: -1, message: err.message });
    }
  };

  // GET API
  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 20;
    try {
      const data = await userService.find({
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

  // API
  // [POST] /users/create
  create = async (req, res) => {
    const data = await userService.create({
      ...req.body,
      password: userService.hashPassword(req.body.password),
    });

    if (data.code === -1) {
      return res.status(500).json(data);
    }

    res.json(data);
  };

  // [PUT] /users
  update = async (req, res) => {
    const userId = req.user.user_id; // Lấy userId từ token hoặc session
    const updateData = { ...req.body }; // Dữ liệu cần cập nhật

    try {
      // Gọi hàm update từ service với đúng cấu trúc
      const result = await userService.update({
        where: { user_id: userId }, // Điều kiện where để tìm user theo userId
        data: updateData, // Dữ liệu cần cập nhật
      });

      if (result.code === -1) {
        return res.status(500).json(result); // Lỗi server
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user." });
    }
  };

  // getTotalUser
  totalUsers = async (req, res) => {
    try {
      // Lấy tổng số người dùng
      const totalUsers = await db.User.count("user_id");

      // Lấy danh sách người dùng
      const users = await db.User.findAll({
        attributes: ["user_id", "username", "email", "created_at"], // Chọn các trường cần thiết
        limit: 10, // Có thể tùy chỉnh số lượng bản ghi trả về
        offset: 0, // Có thể tùy chỉnh để phân trang
      });

      return res.status(200).json({
        code: 0,
        message: "Success",
        data: {
          totalUsers,
          users, // Danh sách người dùng
        },
      });
    } catch (error) {
      return res.status(500).json({
        code: -1,
        message: error.message,
      });
    }
  };
}

module.exports = new UserController();
