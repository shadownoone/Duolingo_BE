const userService = require("../services/userService");
const BaseController = require("./BaseController");
const db = require("~/models");

class UserController extends BaseController {
  constructor() {
    super("user");
  }

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

  //getTotalUser
  totalUsers = async (req, res) => {
    try {
      const totalUsers = await db.User.count("user_id");
      return res.status(200).json({
        code: 0,
        message: "Success",
        data: {
          totalUsers,
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
