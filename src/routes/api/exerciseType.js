const router = require("express").Router();

const ExerciseTypeController = require("~/controllers/ExerciseTypeController");

// [GET] /exerciseType
router.get("/all", ExerciseTypeController.get);

router.get("/:genreName", ExerciseTypeController.getMangaByGenre);

// [POST] /exerciseType
router.post("/add", ExerciseTypeController.createTypeName);

// [PUT] /exerciseType/:id
router.put("/:id", ExerciseTypeController.update);

// [DELETE] /exerciseType/:id
router.delete("/:id", ExerciseTypeController.delete);

module.exports = router;
