const router = require("express").Router();

const languageController = require("~/controllers/LangugeController");

router.get("/search", languageController.searchLanguage);

router.get("/all", languageController.get);

router.get("/:languageId", languageController.getCoursesByLanguage);

router.post("/create", languageController.create);

router.put("/:id", languageController.update);

router.delete("/:language_id", languageController.delete);

module.exports = router;
