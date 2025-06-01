// chat.js
const { Op } = require("sequelize");
const db = require("~/models");
// import hàm analyzeOptions từ module mới
const { analyzeOptions } = require("~/utils/genai");

const router = require("express").Router();

// Route để chat và phân tích câu hỏi
router.post("/", async (req, res) => {
  const { message, exercise_id } = req.body;

  // Kiểm tra message
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const userId = req.user?.user_id;
    if (!userId) {
      return res.status(400).json({ error: "User not authenticated" });
    }

    // Lấy exercise từ DB
    const exercise = await db.Exercise.findOne({
      where: { exercise_id: exercise_id },
      include: [
        { model: db.Lesson, as: "lesson" },
        { model: db.ExerciseType, as: "exerciseType" },
        { model: db.ExerciseOption, as: "options" },
      ],
    });

    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    // Lấy dàn options (nhiều lựa chọn)
    const options = await db.ExerciseOption.findAll({
      where: { exercise_id: exercise_id },
      include: [{ model: db.Exercise, as: "exercise" }],
    });

    const question = exercise.question_content;
    // Nối tất cả option_text thành chuỗi, phân cách bằng dấu phẩy
    const optionsText = options.map((option) => option.option_text).join(", ");

    // Context (có thể lấy từ exercise.lesson, exercise.exerciseType,... nếu muốn)
    const context = "Thông tin bài học liên quan sẽ được cung cấp ở đây";

    // Gọi ChatGPT để phân tích
    const analysis = await analyzeOptions(question, optionsText, context);

    // Lưu tin nhắn user vào DB
    await db.Message.create({
      user_id: userId,
      sender: "user",
      text: message,
    });

    // Lấy lại 20 tin nhắn gần nhất (nếu Anh cần hiển thị lịch sử chat)
    const messages = await db.Message.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
      limit: 20,
    });
    messages.reverse();

    // Tạo message bot với nội dung analysis
    const reply = await db.Message.create({
      user_id: userId,
      sender: "bot",
      text: analysis || "Không có phản hồi từ AI.",
    });

    // Trả về JSON (Anh có thể trả thêm messages nếu muốn)
    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error while chatting with AI" });
  }
});

module.exports = router;
