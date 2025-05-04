const router = require("express").Router();

const FriendController = require("~/controllers/FriendController");

// [GET] /Rating
router.get("/", FriendController.get);

const { authenticateUser } = require("~/middlewares/authMiddleware");

router.get("/getFriend", authenticateUser, FriendController.getFriends);

// [POST] /Rating
router.post("/", FriendController.create);

// [PUT] /Rating/:id
router.put("/:id", FriendController.update);

// [DELETE] /Rating/:id
router.delete("/:id", FriendController.delete);

module.exports = router;
