const router = require("express").Router();

const BadgeController = require("~/controllers/BadgeController");

// [GET] /Badge
router.get("/", BadgeController.get);

// [POST] /Badge
router.post("/", BadgeController.create);

// [PUT] /Badge/:badge_id
router.put("/:badge_id", BadgeController.update);

// [DELETE] /Badge/:id
router.delete("/:badge_id", BadgeController.delete);

module.exports = router;
