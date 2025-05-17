const exerciseTypeService = require("../services/exerciseTypeService");
const db = require("~/models");
const BaseController = require("./BaseController");

class ExerciseTypeController extends BaseController {
  constructor() {
    super("exerciseType");
  }

  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 50;
    try {
      const data = await exerciseTypeService.find({
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

  createTypeName = async (req, res) => {
    const exercise_type_name = req.body.exercise_type_name;

    try {
      let exTypeName = await db.ExerciseType.findOne({
        where: { exercise_type_name: exercise_type_name },
      });
      if (!exTypeName) {
        exTypeName = await db.ExerciseType.create({
          exercise_type_name: exercise_type_name,
        });
      }

      // Trả về exTypeName đã tồn tại hoặc vừa tạo
      res
        .status(201)
        .json({ message: "exTypeName checked/added", data: exTypeName });
    } catch (error) {
      console.error("Error details:", error);
      res.status(500).json({
        message: "Error checking/adding exTypeName",
        error: error.message,
      });
    }
  };

  update = async (req, res) => {
    const { id } = req.params;
    const { exercise_type_name } = req.body;

    try {
      let exTypeName = await db.ExerciseType.findByPk(id);
      if (!exTypeName) {
        return res.status(404).json({ message: "Genre not found" });
      }
      await exTypeName.update({ exercise_type_name: exercise_type_name });
      res
        .status(200)
        .json({ message: "Genre updated successfully", data: exTypeName });
    } catch (error) {
      console.error("Error updating exTypeName:", error);
      res
        .status(500)
        .json({ message: "Error updating exTypeName", error: error.message });
    }
  };

  delete = async (req, res) => {
    const { id } = req.params;

    try {
      const typeName = await db.ExerciseType.findByPk(id);
      if (!typeName) {
        return res.status(404).json({ message: "typeName not found" });
      }

      await typeName.destroy();

      return res.status(200).json({ message: "typeName deleted successfully" });
    } catch (error) {
      console.error("Error deleting typeName:", error);
      return res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };

  // GET API
  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 20;
    try {
      const data = await exerciseTypeService.find({
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

  // API lấy truyện theo tên thể loại
  getMangaByGenre = async (req, res) => {
    const genreName = req.params.genreName;
    try {
      // Tìm thể loại dựa trên tên
      const genre = await db.Genre.findOne({
        where: { name: genreName },
      });

      if (!genre) {
        return res.status(404).json({ message: "Thể loại không tồn tại" });
      }

      // Tìm các truyện thuộc thể loại này cùng với chương mới nhất của từng truyện
      const mangas = await db.Manga.findAll({
        include: [
          {
            model: db.Genre,
            as: "genres", // Alias của mô hình Genre
            where: { genre_id: genre.genre_id },
            through: { attributes: [] }, // Bỏ qua các thuộc tính từ bảng liên kết
          },
          {
            model: db.Chapter,
            as: "chapters", // Alias của mô hình Chapter
            limit: 1, // Lấy một chương
            order: [["chapter_number", "DESC"]],
          },
        ],
        attributes: [
          "manga_id",
          "title",
          "description",
          "author",
          "views",
          "slug",
          "cover_image",
          "createdAt",
          "updatedAt",
        ],
        raw: false,
      });

      // Trả về danh sách truyện cùng chương cuối cùng
      return res.status(200).json({
        success: true,
        data: mangas,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy truyện theo thể loại",
        error: error.message,
      });
    }
  };
}

module.exports = new ExerciseTypeController();
