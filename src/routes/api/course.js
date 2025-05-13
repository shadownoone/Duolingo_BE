const router = require("express").Router();

const courseController = require("~/controllers/CourseController");
const { authenticateUser } = require("~/middlewares/authMiddleware");

// [GET] /Favorites
router.get("/", courseController.get);
router.get("/:courseId", courseController.getLessonByCourse);

router.get("/lan/:languageId", courseController.getCoursesByLanguageP2);

// router.get("/:courseId", courseController.getLessonByCourse);

// [POST] /Favorites
// router.post("/", courseController.create);

router.post("/create", courseController.create);

router.put("/:id", courseController.update);

// [DELETE]
router.delete("/:course_id", courseController.delete);

module.exports = router;
