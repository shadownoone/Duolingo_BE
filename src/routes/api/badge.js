const router = require("express").Router();

const BadgeController = require("~/controllers/BadgeController");

// [GET] /Chapter
router.get("/", BadgeController.get);

// [POST] /Chapter
router.post("/", BadgeController.create);

// [PUT] /Chapter/:id
router.put("/:id", BadgeController.update);

// [DELETE] /Chapter/:id
router.delete("/:id", BadgeController.delete);

module.exports = router;
