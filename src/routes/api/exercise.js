const router = require("express").Router();

const ExerciseController = require("~/controllers/ExerciseController");
const { authenticateUser } = require("~/middlewares/authMiddleware");

// [GET] /History
router.get("/", ExerciseController.get);

// [POST] /History
router.post("/", ExerciseController.create);

// [POST] /histories/update
router.post("/update", authenticateUser, ExerciseController.update);

// [PUT] /History/:id
// router.put("/:id", ExerciseController.update);

// [DELETE] /History/:id
router.delete("/delete", authenticateUser, ExerciseController.delete);

module.exports = router;
