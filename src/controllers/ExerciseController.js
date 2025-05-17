const exerciseService = require("../services/exerciseService");
const db = require("~/models");
const BaseController = require("./BaseController");

class ExerciseController extends BaseController {
  constructor() {
    super("exercise");
  }

  // GET API
  getExerciseByLesson = async (req, res) => {
    try {
      const { lessonId } = req.params;
      const exercise = await db.Lesson.findOne({
        where: { lesson_id: lessonId },
        include: [
          {
            model: db.Exercise,
            as: "exercises",
            include: [
              {
                model: db.ExerciseType,
                as: "exerciseType",
              },
              {
                model: db.ExerciseOption,
                as: "options",
              },
            ],
          },
        ],
      });
      if (!exercise) {
        return res
          .status(404)
          .json({ code: -1, message: "exercise not found" });
      }
      return res.status(200).json({
        code: 0,
        message: "ok",
        data: exercise,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ code: -1, message: error.message });
    }
  };

  update = async (req, res) => {
    const userId = req.user.user_id;
    const mangaId = req.body.manga_id;
    const chapterId = req.body.chapter_id;

    try {
      // Kiểm tra xem lịch sử đã tồn tại cho manga và chapter này chưa
      const historiesResponse = await exerciseService.find({
        where: {
          user_id: userId,
          manga_id: mangaId, // Chỉ tìm lịch sử đọc của manga này
        },
        findOne: true, // Tìm lịch sử của một chapter cụ thể
      });

      if (
        historiesResponse &&
        historiesResponse.code === 0 &&
        historiesResponse.data
      ) {
        // Nếu có lịch sử cho chapter hiện tại, cập nhật
        const history = historiesResponse.data; // lấy bản ghi lịch sử

        // Cập nhật thuộc tính last_read_at và chapter_id
        history.chapter_id = chapterId;
        history.last_read_at = new Date();

        // Gọi phương thức update để lưu thay đổi
        await exerciseService.update({
          where: {
            user_id: userId,
            manga_id: mangaId,
          },
          data: history,
        });

        console.log("History updated successfully");
      } else {
        // Nếu chưa có lịch sử, tạo mới

        await exerciseService.create({
          user_id: userId,
          manga_id: mangaId,
          chapter_id: chapterId,
          last_read_at: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      res.status(200).json({ message: "Lịch sử đọc đã được cập nhật" });
    } catch (error) {
      console.error("Error occurred:", error);
      res.status(500).json({ message: "Có lỗi xảy ra", error });
    }
  };

  // DELETE
  delete = async (req, res) => {
    try {
      const historyId = req.body.historyId;

      // Tìm và xóa yêu thích bằng history_id
      const deletedHistory = await exerciseService.delete({
        where: { history_id: historyId },
      });

      if (!deletedHistory) {
        return res.status(404).json({ message: "Không tìm thấy mục lịch sử." });
      }

      return res.status(200).json({
        message: "Đã xóa khỏi danh sách lịch sử thành công!",
      });
    } catch (error) {
      console.error("Lỗi khi xóa lịch sử:", error);
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
  };
}

module.exports = new ExerciseController();
