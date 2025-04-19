const courseService = require("../services/courseService");
const db = require("~/models");
const BaseController = require("./BaseController");
const mangaService = require("~/services/languageService");

class CourseController extends BaseController {
  constructor() {
    super("course");
  }

  //get lesson by course
  getLessonByCourse = async (req, res) => {
    try {
      const { courseId } = req.params; // Lấy courseId từ params
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;

      const lessons = await db.Lesson.findAll({
        where: { course_id: courseId },
        include: [
          {
            model: db.Course,
            attributes: [
              "course_id",
              "course_name",
              "description", // hoặc bất cứ field nào bạn muốn
            ],
          },
        ],
        order: [["lesson_order", "ASC"]],
        offset: (page - 1) * pageSize,
        limit: pageSize,
      });

      return res.status(200).json({
        code: 0,
        message: "ok",
        data: lessons,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ code: -1, message: error.message });
    }
  };

  // GET API
  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;
    try {
      const data = await courseService.find({
        page: page,
        pageSize: pageSize,

        raw: false,
      });

      if (data.code === -1) {
        return res.status(500).json(data);
      }

      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ code: -1, message: error.message });
    }
  };

  // CREATE
  addFavorite = async (req, res) => {
    try {
      const userId = req.user.user_id;

      const mangaId = req.body.manga_id;

      // Kiểm tra xem truyện đã tồn tại trong danh sách yêu thích chưa
      const existingFavorite = await courseService.find({
        findOne: true,
        where: { user_id: userId, manga_id: mangaId },
      });

      // Sửa điều kiện kiểm tra để đảm bảo rằng chỉ báo lỗi nếu có dữ liệu
      if (existingFavorite.code === 0 && existingFavorite.data.length > 0) {
        return res.status(400).json({ message: "Manga already in favorites." });
      }

      // Thêm truyện vào danh sách yêu thích
      const newFavorite = await courseService.create({
        user_id: userId,
        manga_id: mangaId,
      });

      await mangaService.incrementFollowers(mangaId);

      return res.status(200).json({
        message: "Thêm truyện vào danh sách yêu thích thành công!",
        favorite: newFavorite,
      });
    } catch (error) {
      console.error("Error adding to favorites:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };

  // DELETE
  removeFavorite = async (req, res) => {
    try {
      const favoriteId = req.body.favorite_id;

      // Tìm mục yêu thích để lấy mangaId
      const existingFavorite = await courseService.find({
        findOne: true,
        where: { favorite_id: favoriteId },
      });

      // Log ra dữ liệu của existingFavorite
      console.log("Existing Favorite:", existingFavorite);

      // Kiểm tra xem có tìm thấy mục yêu thích không
      if (!existingFavorite || existingFavorite.data.length === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy mục yêu thích." });
      }

      // Lấy mangaId từ mục yêu thích
      const mangaId = existingFavorite.data.manga_id;

      // Tìm và xóa yêu thích bằng favorite_id
      const deletedFavorite = await courseService.delete({
        where: { favorite_id: favoriteId },
      });

      if (!deletedFavorite) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy mục yêu thích." });
      }

      // Giảm người theo dõi
      await mangaService.decrementFollowers(mangaId);

      return res.status(200).json({
        message: "Đã xóa khỏi danh sách yêu thích thành công!",
      });
    } catch (error) {
      console.error("Lỗi khi xóa yêu thích:", error);
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
  };
}

module.exports = new CourseController();
