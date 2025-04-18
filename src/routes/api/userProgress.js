const router = require("express").Router();

const UserProgressController = require("~/controllers/UserProgressController");

const { authenticateUser } = require("~/middlewares/authMiddleware");

// [GET] /Manga
router.get("/all", UserProgressController.get);

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
