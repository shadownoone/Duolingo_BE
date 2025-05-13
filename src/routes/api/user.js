const router = require("express").Router();
const uploadImage = require("../../utils/uploadImage");

const userController = require("~/controllers/UserController");
const { authenticateUser } = require("~/middlewares/authMiddleware");

router.get("", userController.get);

router.post("/buyHeart", authenticateUser, userController.purchaseHeart);

router.post("/updateHeart", authenticateUser, userController.updateHeart);

router.post("/practice", authenticateUser, userController.recordPractice);

router.get("/getLanguage", authenticateUser, userController.getLanguages);

router.post("/userLanguage", authenticateUser, userController.addLanguage);

// Get TotalUser
router.get("/total", userController.totalUsers);

// [POST] /users
router.post("/create", userController.create);

// [PUT] /users
router.put("/update", authenticateUser, userController.update);

// [DELETE] /users/:id
router.delete("/:id", userController.delete);

router.post("/uploadImage", (req, res) => {
  uploadImage(req.body.image)
    .then((url) => res.send(url))
    .catch((err) => res.status(500).send(err));
});

router.post("/uploadMultipleImages", (req, res) => {
  uploadImage
    .uploadMultipleImages(req.body.images)
    .then((urls) => res.send(urls))
    .catch((err) => res.status(500).send(err));
});

module.exports = router;
