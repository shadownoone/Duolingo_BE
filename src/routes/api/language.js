const router = require("express").Router();

const languageController = require("~/controllers/LangugeController");

router.get("/all", languageController.get);

router.get("/:languageId", languageController.getCoursesByLanguage);

router.post("/create", languageController.create);

router.get("/search", languageController.searchManga);

router.delete("/:manga_id", languageController.delete);

module.exports = router;
