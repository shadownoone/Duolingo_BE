const router = require("express").Router();

const FriendController = require("~/controllers/FriendController");

// [GET] /Rating
router.get("/", FriendController.get);

// [POST] /Rating
router.post("/", FriendController.create);

// [PUT] /Rating/:id
router.put("/:id", FriendController.update);

// [DELETE] /Rating/:id
router.delete("/:id", FriendController.delete);

module.exports = router;
