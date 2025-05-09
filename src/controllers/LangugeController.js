const languageService = require("../services/languageService");
const db = require("~/models");
const { Op } = require("sequelize");
const BaseController = require("./BaseController");
const slugify = require("slugify");
const { removeVietnameseTones } = require("../utils/slug");

class LanguageController extends BaseController {
  constructor() {
    super("language");
  }

  getCoursesByLanguage = async (req, res) => {
    try {
      const { languageId } = req.params;
      const language = await db.Language.findOne({
        where: { language_id: languageId },
        include: [
          {
            model: db.Course,
            as: "courses", // Phải khớp với alias đã định nghĩa trong association
          },
        ],
      });
      if (!language) {
        return res
          .status(404)
          .json({ code: -1, message: "Language not found" });
      }
      return res.status(200).json({
        code: 0,
        message: "ok",
        data: language,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ code: -1, message: error.message });
    }
  };

  // POST Manga
  create = async (req, res) => {
    try {
      // Lấy dữ liệu từ request body
      const { language_code, language_name, description } = req.body;

      if (!language_code || !language_name) {
        return res.status(400).json({ message: "Title is required" });
      }

      const newLanguage = await db.Language.create({
        language_code,
        language_name,
        description,

        created_at: new Date(),
      });

      // Trả về kết quả
      return res.status(201).json({
        message: "Language created successfully",
        data: newLanguage,
      });
    } catch (error) {
      console.error("Error creating manga:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  //PUT Language
  update = async (req, res) => {
    const { id } = req.params; // Lấy id từ params
    const { language_name, description } = req.body; // Lấy thông tin cập nhật từ body

    try {
      const manga = await db.Language.findByPk(id);
      if (!manga) {
        return res.status(404).json({ message: "Language not found" });
      }

      const updatedLanguage = await manga.update({
        language_name: language_name || manga.language_name,
        description: description || manga.description,
      });

      return res.status(200).json({
        message: "updatedLanguage updated successfully",
        data: updatedLanguage,
      });
    } catch (error) {
      console.error("Error updating updatedLanguage:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  // GET API
  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 50;
    try {
      const data = await languageService.find({
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

  // SEARCH LANGUAGE
  searchLanguage = async (req, res) => {
    const { q } = req.query; // Lấy từ khóa tìm kiếm từ query params
    if (!q) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    try {
      const languages = await db.Language.findAll({
        where: {
          [Op.or]: [
            { language_name: { [Op.like]: `%${q}%` } },
            { language_code: { [Op.like]: `%${q}%` } },
          ],
        },
      });

      if (languages.length === 0) {
        return res.status(404).json({ message: "No languages found" });
      }

      return res.status(200).json({
        success: true,
        data: languages,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error occurred during search",
        error: error.message,
      });
    }
  };

  //DELETE Language
  delete = async (req, res) => {
    try {
      const language_id = req.params.language_id;
      console.log(language_id);

      await languageService.delete({
        where: { language_id: language_id },
      });

      return res.status(200).json({
        message: "Đã xóa Language!",
      });
    } catch (error) {
      console.error("Lỗi khi xóa manga:", error);
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
  };
}

module.exports = new LanguageController();
