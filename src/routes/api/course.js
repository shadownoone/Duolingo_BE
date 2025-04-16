const router = require("express").Router();

const courseController = require("~/controllers/CourseController");
const { authenticateUser } = require("~/middlewares/authMiddleware");

// [GET] /Favorites
router.get("/", courseController.get);

router.get("/:courseId", courseController.getLessonByCourse);

// [POST] /Favorites
// router.post("/", courseController.create);

router.post("/add", authenticateUser, courseController.addFavorite);

// [PUT] /Favorites/:id
router.put("/:id", courseController.update);

// [DELETE]
router.delete("/remove", authenticateUser, courseController.removeFavorite);

module.exports = router;
