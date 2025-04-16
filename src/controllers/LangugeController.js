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

  //POST Manga
  // POST Manga
  create = async (req, res) => {
    try {
      // Lấy dữ liệu từ request body
      const {
        title,
        description,
        author,
        cover_image,
        status,
        is_vip,
        genres,
      } = req.body;

      // Kiểm tra xem title đã được cung cấp chưa
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }

      // Tạo slug từ title
      const slug = slugify(title, {
        lower: true, // Chuyển sang chữ thường
        strict: true, // Loại bỏ ký tự đặc biệt
      });

      // Kiểm tra xem slug đã tồn tại hay chưa
      const existingManga = await db.Manga.findOne({ where: { slug } });
      if (existingManga) {
        return res
          .status(400)
          .json({ message: "Manga with this title already exists" });
      }

      // Tạo bản ghi Manga mới
      const newManga = await db.Manga.create({
        title,
        description,
        author: author || "Unknown", // Nếu không có author thì set mặc định là Unknown
        cover_image: cover_image || "", // Nếu không có ảnh bìa thì để trống
        status: status || 0, // Mặc định là đang cập nhật (status = 0)
        is_vip: is_vip || false, // Mặc định là không VIP
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0, // Lượt xem ban đầu là 0
        followers: 0, // Người theo dõi ban đầu là 0
      });

      // Xử lý genres nếu có trong request
      if (genres && Array.isArray(genres)) {
        for (const genreName of genres) {
          // Tìm genre trong bảng Genre
          let genre = await db.Genre.findOne({ where: { name: genreName } });

          // Nếu genre không tồn tại, tạo mới
          if (!genre) {
            genre = await db.Genre.create({ name: genreName });
          }

          // Thêm thể loại vào bảng Manga_Genres
          await db.Manga_Genres.create({
            manga_id: newManga.manga_id,
            genre_id: genre.genre_id,
          });
        }
      }

      // Trả về kết quả
      return res.status(201).json({
        message: "Manga created successfully",
        data: newManga,
      });
    } catch (error) {
      console.error("Error creating manga:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

  //PUT Manga
  //PUT Manga
  update = async (req, res) => {
    const { id } = req.params; // Lấy id từ params
    const { title, description, author, cover_image, status, is_vip, genres } =
      req.body; // Lấy thông tin cập nhật từ body

    try {
      // Kiểm tra nếu Manga có tồn tại hay không
      const manga = await db.Manga.findByPk(id);
      if (!manga) {
        return res.status(404).json({ message: "Manga not found" });
      }

      // Nếu có cập nhật title thì tạo slug mới từ title
      let newSlug = manga.slug; // Giữ nguyên slug nếu không cập nhật title
      if (title && title !== manga.title) {
        const normalizedTitle = removeVietnameseTones(title); // Chuẩn hóa title bằng cách loại bỏ dấu
        newSlug = slugify(normalizedTitle, {
          lower: true, // Chuyển sang chữ thường
          strict: true, // Loại bỏ ký tự đặc biệt
        });
        console.log("New slug:", newSlug);
      }

      // Kiểm tra và chuyển đổi status và is_vip về số (integer)
      const updatedStatus =
        status !== undefined ? parseInt(status, 10) : manga.status;
      const updatedIsVip =
        is_vip !== undefined ? (is_vip ? 1 : 0) : manga.is_vip;

      // Cập nhật thông tin Manga
      const updatedManga = await manga.update({
        title: title || manga.title,
        description: description || manga.description,
        author: author || manga.author,
        cover_image: cover_image || manga.cover_image,
        status: updatedStatus,
        is_vip: updatedIsVip,
        slug: newSlug,
        updatedAt: new Date(),
      });

      // Cập nhật các thể loại của Manga
      if (genres && Array.isArray(genres)) {
        // Xóa các thể loại hiện tại của manga từ bảng manga_genres
        await db.Manga_Genres.destroy({ where: { manga_id: id } });

        // Thêm các thể loại mới vào bảng manga_genres
        for (const genreName of genres) {
          const genre = await db.Genre.findOne({ where: { name: genreName } });
          if (genre) {
            await db.Manga_Genres.create({
              manga_id: id,
              genre_id: genre.genre_id,
            });
          }
        }
      }

      return res.status(200).json({
        message: "Manga updated successfully",
        data: updatedManga,
      });
    } catch (error) {
      console.error("Error updating manga:", error);
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

  // API tìm kiếm truyện theo từ khóa
  searchManga = async (req, res) => {
    const { q } = req.query; // Lấy từ khóa tìm kiếm từ query params
    if (!q) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    try {
      const mangas = await db.Manga.findAll({
        where: {
          // Tìm kiếm theo tiêu đề hoặc mô tả truyện có chứa từ khóa
          [Op.or]: [{ title: { [Op.like]: `%${q}%` } }],
        },
        include: [
          {
            model: db.Chapter,
            as: "chapters",
            limit: 1, // Lấy chương mới nhất
            order: [["chapter_number", "DESC"]],
          },
          {
            model: db.Genre,
            as: "genres",
            attributes: ["name"], // Lấy tên thể loại
            through: { attributes: [] }, // Bỏ qua các thuộc tính của bảng liên kết
          },
        ],
      });

      if (mangas.length === 0) {
        return res.status(404).json({ message: "No mangas found" });
      }

      return res.status(200).json({
        success: true,
        data: mangas,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error occurred during search",
        error: error.message,
      });
    }
  };

  //DELETE Manga
  delete = async (req, res) => {
    try {
      const manga_id = req.params.manga_id;
      console.log(manga_id);

      await mangaService.delete({
        where: { manga_id: manga_id },
      });

      return res.status(200).json({
        message: "Đã xóa manga!",
      });
    } catch (error) {
      console.error("Lỗi khi xóa manga:", error);
      return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
    }
  };
}

module.exports = new LanguageController();
