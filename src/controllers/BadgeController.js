const badgeService = require("../services/badgeService");
const BaseController = require("./BaseController");
const db = require("~/models");

class BadgeController extends BaseController {
  constructor() {
    super("badge");
  }

  // GET API
  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;

    const data = await badgeService.find({
      page: page,
      pageSize: pageSize,

      raw: false,
    });

    if (data.code === -1) {
      return res.status(500).json(data);
    }

    return res.status(200).json(data);
  };

  // POST
  create = async (req, res) => {
    try {
      const { badge_name, description, icon_url, xp_threshold } = req.body;
      if (!badge_name) {
        return res.status(400).json({ message: " is required" });
      }
      const newBadge = await db.Badge.create({
        badge_name,
        description,
        icon_url,
        xp_threshold,
        created_at: new Date(),
      });
      return res.status(201).json({
        code: 0,
        message: "badge created successfully",
        data: newBadge,
      });
    } catch (error) {
      console.error("Error creating badge:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  update = async (req, res) => {
    const { badge_id } = req.params;
    const { badge_name, description, icon_url, xp_threshold } = req.body;

    try {
      const badge = await db.Badge.findByPk(badge_id);
      if (!badge) {
        return res.status(404).json({ message: "badge not found" });
      }

      const updatedbadge = await badge.update({
        badge_name: badge_name || badge.badge_name,
        description: description || badge.description,
        icon_url: icon_url || badge.icon_url,
        xp_threshold: xp_threshold || badge.xp_threshold,
      });

      return res.status(200).json({
        code: 0,
        message: "badge updated successfully",
        data: updatedbadge,
      });
    } catch (error) {
      console.error("Error updating updatedbadge:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  delete = async (req, res) => {
    try {
      const badge_id = req.params.badge_id;

      await badgeService.delete({
        where: { badge_id: badge_id },
      });

      return res.status(200).json({
        message: "Đã xóa badge_id!",
      });
    } catch (error) {
      console.error("Lỗi khi xóa manga:", error);
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
  };
}

module.exports = new BadgeController();
