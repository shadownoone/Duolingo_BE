const router = require("express").Router();

const ExerciseTypeController = require("~/controllers/ExerciseTypeController");

// [GET] /Genre
router.get("/all", ExerciseTypeController.get);

router.get("/:genreName", ExerciseTypeController.getMangaByGenre);

// [POST] /Genre
router.post("/add", ExerciseTypeController.createGenre);

// [PUT] /Genre/:id
router.put("/:id", ExerciseTypeController.update);

// [DELETE] /Genre/:id
router.delete("/:id", ExerciseTypeController.delete);

module.exports = router;
