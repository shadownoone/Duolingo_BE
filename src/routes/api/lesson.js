const router = require("express").Router();

const LessonController = require("~/controllers/LessonController");

// [GET] /Chapter
router.get("/", LessonController.get);

router.get("/:lessonId", LessonController.getLessonDetail);

// [POST] /Chapter
router.post("/", LessonController.create);

// [PUT] /Chapter/:id
router.put("/:id", LessonController.update);

// [DELETE] /Chapter/:id
router.delete("/:id", LessonController.delete);

module.exports = router;
