const router = require("express").Router();

const ExerciseController = require("~/controllers/ExerciseController");
const { authenticateUser } = require("~/middlewares/authMiddleware");
const { uploadMedia } = require("~/utils/uploadImage");

// [GET] /Exersice
router.get("/:lessonId", ExerciseController.getExerciseByLesson);

// [POST] /Exersice
router.post("/create", ExerciseController.create);

// [POST] /histories/update
router.put("/update/:exercise_id", ExerciseController.update);

router.delete("/delete/:exercise_id", ExerciseController.delete);

router.post("/uploadMedia", async (req, res) => {
  if (!req.files || !req.files.media) {
    return res.status(400).json({ message: "No media file uploaded" });
  }
  try {
    const filePath = req.files.media.tempFilePath;
    const url = await uploadMedia(filePath);
    return res.json({ url });
  } catch (err) {
    console.error("uploadMedia error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
