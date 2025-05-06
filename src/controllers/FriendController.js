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
        attributes: [],
        include: [
          {
            model: db.User,
            as: "followed",
            attributes: ["user_id", "username", "avatar"],
          },
        ],
        order: [["created_at", "DESC"]],
      });
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

  getFollwers = async (req, res) => {
    const userId = req.user.user_id;
    try {
      const friends = await db.Friend.findAll({
        where: {
          friend_user_id: userId,
          status: "accepted",
        },
        attributes: [],
        include: [
          {
            model: db.User,
            as: "follower",
            attributes: ["user_id", "username", "avatar"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      const data = friends.map((f) => f.follower);

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

  unfollowUser = async (req, res) => {
    const userId = req.user.user_id;
    const { followedUserId } = req.params;
    try {
      const friendship = await db.Friend.findOne({
        where: {
          user_id: userId,
          friend_user_id: followedUserId,
          status: "accepted",
        },
      });

      if (!friendship) {
        return res.status(404).json({
          code: -1,
          message: "No such friendship exists or already unfollowed",
        });
      }

      await friendship.update({
        status: "unfollowed",
      });

      return res.json({
        code: 0,
        message: "Unfollowed successfully",
      });
    } catch (err) {
      console.error("Error in unfollowUser:", err);
      return res.status(500).json({
        code: -1,
        message: err.message,
      });
    }
  };

  autoFollowUser = async (req, res) => {
    const userId = req.user.user_id;
    const { friendId } = req.params;

    if (userId === Number(friendId)) {
      return res.status(400).json({
        code: -1,
        message: "You cannot follow yourself",
      });
    }

    try {
      // Kiểm tra xem mối quan hệ đã tồn tại chưa
      const existingFollow = await db.Friend.findOne({
        where: {
          user_id: userId,
          friend_user_id: friendId,
        },
      });

      if (existingFollow) {
        // Nếu đã tồn tại, kiểm tra trạng thái
        if (existingFollow.status === "accepted") {
          return res.status(400).json({
            code: -1,
            message: "You are already following this user",
          });
        }

        // Nếu chưa được chấp nhận, cập nhật trạng thái thành accepted
        await existingFollow.update({
          status: "accepted",
        });

        return res.json({
          code: 0,
          message: "Followed successfully",
        });
      }

      // Nếu chưa có mối quan hệ, tạo mới mối quan hệ với trạng thái accepted
      await db.Friend.create({
        user_id: userId,
        friend_user_id: friendId,
        status: "accepted",
      });

      return res.json({
        code: 0,
        message: "Followed successfully",
      });
    } catch (err) {
      console.error("Error in autoFollowUser:", err);
      return res.status(500).json({
        code: -1,
        message: err.message,
      });
    }
  };
}

module.exports = new FriendController();
