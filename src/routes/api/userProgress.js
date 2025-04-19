const router = require("express").Router();

const UserProgressController = require("~/controllers/UserProgressController");

const { authenticateUser } = require("~/middlewares/authMiddleware");

// [GET] /Manga
router.get("/all", UserProgressController.get);

router.get("/leaderboard", authenticateUser, async (req, res, next) => {
  try {
    // có thể nhận ?limit=10 từ query string
    const limit = parseInt(req.query.limit) || 10;
    const data = await UserProgressController.getLeaderboard(limit);
    return res.json({
      code: 0,
      message: "OK",
      data,
    });
  } catch (err) {
    next(err);
  }
});
router.get("/getByUser", authenticateUser, UserProgressController.getByUser);

// POST hoàn thành lesson:   /api/userProgress/complete
router.post(
  "/complete",
  authenticateUser,
  UserProgressController.completeLesson
);

// [POST] /Manga
router.post("/", UserProgressController.create);

// [PUT] /Manga/:id
router.put("/:id", UserProgressController.update);

// [DELETE] /Manga/:id
router.delete("/:id", UserProgressController.delete);

module.exports = router;
