const router = require("express").Router();

const languageController = require("~/controllers/LangugeController");

router.post("/create", languageController.create);

router.get("/all", languageController.get);

router.get("/search", languageController.searchManga);

router.delete("/:manga_id", languageController.delete);

module.exports = router;
