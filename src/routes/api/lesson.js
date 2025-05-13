const router = require("express").Router();

const LessonController = require("~/controllers/LessonController");

// [GET] /Chapter
router.get("/", LessonController.get);

router.get("/les/:courseId", LessonController.getLessByCourse);

router.get("/:lessonId", LessonController.getLessonDetail);

// [POST]
router.post("/", LessonController.create);

// [PUT]
router.put("/:lessonId", LessonController.update);

// [DELETE] /Chapter/:id
router.delete("/:lesson_id", LessonController.delete);

module.exports = router;
