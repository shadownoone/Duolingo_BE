const router = require("express").Router();

const languageRouter = require("./language");

const lessonRouter = require("./lesson");

const badgeRouter = require("./badge");

const exerciseTypeRouter = require("./exerciseType");

const userProgressRouter = require("./userProgress");

const courseRouter = require("./course");

const userBadgeRouter = require("./userBadge");

const exerciseRouter = require("./exercise");

const friendRouter = require("./friend");

const authRouter = require("./auth");

const registerRouter = require("./register");

const userRouter = require("./user");

const paymentRouter = require("./payments");

const chatRouter = require("./chat");

const { authenticateUser } = require("~/middlewares/authMiddleware");

router.use("/payments", paymentRouter);

router.use("/languages", languageRouter);

router.use("/lessons", lessonRouter);

router.use("/badges", badgeRouter);

router.use("/exerciseTypes", exerciseTypeRouter);

router.use("/userProgress", userProgressRouter);

router.use("/courses", courseRouter);

router.use("/userBadges", userBadgeRouter);

router.use("/exercises", exerciseRouter);

router.use("/friends", friendRouter);

router.use("/auth", authRouter);

router.use("/registers", registerRouter);

router.use("/users", userRouter);

router.use("/chats", authenticateUser, chatRouter);

module.exports = router;
