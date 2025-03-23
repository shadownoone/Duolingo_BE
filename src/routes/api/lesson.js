const router = require("express").Router();

const LessonController = require("~/controllers/LessonController");

// [GET] /Chapter
router.get("/", LessonController.get);

// [POST] /Chapter
router.post("/", LessonController.create);

// [PUT] /Chapter/:id
router.put("/:id", LessonController.update);

// [DELETE] /Chapter/:id
router.delete("/:id", LessonController.delete);

//GET /Chapter/:id
router.get("/:slug", LessonController.getChapterBySlug);

module.exports = router;
