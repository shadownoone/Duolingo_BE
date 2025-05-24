const router = require("express").Router();

const UserBadgeController = require("~/controllers/UserBadgeController");
const { authenticateUser } = require("~/middlewares/authMiddleware");

// [GET] /Comments
router.get("/all", UserBadgeController.get);

router.post("/assign", authenticateUser, UserBadgeController.assign);

router.get("/userBadge", authenticateUser, UserBadgeController.getUsserBadges);

module.exports = router;
