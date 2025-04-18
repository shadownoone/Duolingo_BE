const lessonService = require("../services/lessonService");
const db = require("~/models");
const slugify = require("slugify");
const BaseController = require("./BaseController");

class LessonController extends BaseController {
  constructor() {
    super("lesson");
  }

  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 50;
    try {
      const data = await lessonService.find({
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

  getLessonDetail = async (req, res) => {
    try {
      const { lessonId } = req.params;

      const lesson = await db.Lesson.findOne({
        where: { lesson_id: lessonId },

        include: [
          {
            model: db.Course,

            attributes: ["language_id"],
          },
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

      if (!lesson) {
        return res
          .status(404)
          .json({ code: -1, message: "Bài học không tồn tại" });
      }

      return res.status(200).json({
        code: 0,
        message: "ok",
        data: lesson,
      });
    } catch (error) {
      console.error("getLessonDetail error:", error);
      return res.status(500).json({ code: -1, message: error.message });
    }
  };

  // Method for creating a new chapter
  create = async (req, res) => {
    const { manga_id, chapter_number, title, images } = req.body; // 'images' là một mảng URL hình ảnh của chapter

    try {
      // 1. Tạo slug từ chapter_number
      const slug = slugify(`chapter-${chapter_number}`, { lower: true });

      // 2. Tạo mới chapter
      const newChapter = await db.Chapter.create({
        manga_id,
        chapter_number,
        title,
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 3. Nếu có danh sách ảnh, thêm vào bảng 'chapter_images'
      if (images && Array.isArray(images) && images.length > 0) {
        const chapterImages = images.map((imageUrl, index) => ({
          chapter_id: newChapter.chapter_id,
          image_url: imageUrl,
          image_order: index + 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        // Bulk insert images
        await db.Chapter_Images.bulkCreate(chapterImages);
      }

      // 4. Trả về thông tin chapter mới tạo
      res.status(201).json({
        message: "Chapter created successfully",
        data: newChapter,
      });
    } catch (error) {
      console.error("Error creating chapter:", error);
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  };
}

module.exports = new LessonController();
