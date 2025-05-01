const { Op } = require("sequelize");
const db = require("~/models");
const { genai } = require("~/utils/genai");

const router = require("express").Router();

// Route để chat và phân tích câu hỏi
router.post("/", async (req, res) => {
  const { message, exercise_id } = req.body; // Lấy exerciseId từ request body

  // Kiểm tra nếu không có tin nhắn thì trả về lỗi
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    // Lấy câu hỏi từ database sử dụng exerciseId
    const exercise = await db.Exercise.findOne({
      where: { exercise_id: exercise_id }, // Dùng exerciseId để tìm câu hỏi
      include: [
        { model: db.Lesson, as: "lesson" },
        { model: db.ExerciseType, as: "exerciseType" },
        { model: db.ExerciseOption, as: "options" },
      ],
    });

    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    const options = await db.ExerciseOption.findAll({
      where: { exercise_id: exercise_id },
      include: [{ model: db.Exercise, as: "exercise" }],
    });

    const question = exercise.question_content;
    const optionsText = options.map((option) => option.option_text).join(", ");

    const context = "Thông tin bài học liên quan sẽ được cung cấp ở đây";
    const analysis = await genai.analyzeOptions(question, optionsText, context);

    await db.Message.create({
      user_id: userId,
      sender: "user",
      text: message,
    });

    const messages = await db.Message.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });

    messages.reverse();

    const geminiRes = analysis;
    const reply = await db.Message.create({
      user_id: userId,
      sender: "bot",
      text: geminiRes || "Không có phản hồi từ AI.",
    });

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error while chatting with AI" });
  }
});

module.exports = router;
