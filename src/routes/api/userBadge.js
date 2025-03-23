const router = require("express").Router();

const UserBadgeController = require("~/controllers/UserBadgeController");
const { authenticateUser } = require("~/middlewares/authMiddleware");

// [GET] /Comments
router.get("/all", UserBadgeController.get);

// [GET] /CommentsByChapter
router.get("/:manga_id", UserBadgeController.getCommentByManga);

// [POST] /Comments
router.post("/create", authenticateUser, UserBadgeController.create);

// [PUT] /Comments/:id
router.put("/:id", UserBadgeController.update);

// [DELETE] /Comments/:id
router.delete("/delete", authenticateUser, UserBadgeController.delete);

module.exports = router;
