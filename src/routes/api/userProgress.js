const router = require("express").Router();

const UserProgressController = require("~/controllers/UserProgressController");

// [GET] /Manga
router.get("/all", UserProgressController.get);

// [GET] /Manga
router.get("/:genreName", UserProgressController.getMangaByGenre);

// [POST] /Manga
router.post("/", UserProgressController.create);

// [PUT] /Manga/:id
router.put("/:id", UserProgressController.update);

// [DELETE] /Manga/:id
router.delete("/:id", UserProgressController.delete);

module.exports = router;
