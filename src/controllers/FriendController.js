const friendService = require("../services/friendService");
const BaseController = require("./BaseController");
const db = require("~/models");

class FriendController extends BaseController {
  constructor() {
    super("friend");
  }

  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    try {
      const data = await friendService.find({
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

  getFriends = async (req, res) => {
    const userId = req.user.user_id;

    try {
      const friends = await db.Friend.findAll({
        where: {
          user_id: userId,
          status: "accepted",
        },
        attributes: [], // không lấy field của Friend
        include: [
          {
            model: db.User,
            as: "followed", // phải khớp với 'as' ở model
            attributes: ["user_id", "username", "avatar"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      // Mỗi record giờ có .followed chứa User tương ứng
      const data = friends.map((f) => f.followed);

      return res.json({
        code: 0,
        message: "Fetched friends list",
        data,
      });
    } catch (err) {
      console.error("Error in getFriends:", err);
      return res.status(500).json({
        code: -1,
        message: err.message,
      });
    }
  };
}

module.exports = new FriendController();
