require("module-alias/register");
require("dotenv").config();

const db = require("~/models");
const passport = require("passport");
const fileUpload = require("express-fileupload");
const authRoute = require("./routes/api/auth");
const cookieSession = require("cookie-session");
const PayOS = require("@payos/node");
const { User } = require("~/models");
const { Op } = require("sequelize");
const moment = require("moment");

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_SECRET_ID,
  process.env.PAYOS_SECRET_KEY
);

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const handlebars = require("express-handlebars");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const passportStrategy = require("~/controllers/passport"); // Import cấu hình passport

const routes = require("./routes");
const { sequelize, connect } = require("./config/connection");
const helpers = require("./helpers/handlebars");
const socketService = require("./services/socketService");
const { authenticateUser } = require("./middlewares/authMiddleware");
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

const generateOrderCode = () => {
  return Math.floor(Math.random() * 100000); // Số ngẫu nhiên nhỏ hơn 1 tỷ
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const port = process.env.PORT || 5000;
connect();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://pay.payos.vn",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.engine(
  "hbs",
  handlebars.engine({
    extname: "hbs",
    helpers: helpers,
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use(morgan("dev"));
app.use(cookieParser());

app.use(
  session({
    secret: "flashblog",
    saveUninitialized: true,
    resave: true,
    cookie: { expires: 300 * 1000 },
  })
);

app.use(passport.initialize()); // Khởi tạo passport
app.use(passport.session()); // Sử dụng session của passport để duy trì đăng nhập

//

app.use(flash());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);
app.use(express.json({ limit: "50mb" }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
  })
);

app.use((req, res, next) => {
  res.io = io;
  next();
});

routes(app);

const YOUR_DOMAIN = "http://localhost:5173";

app.post("/api/v1/payment-link", authenticateUser, async (req, res) => {
  try {
    console.log("🚀 ~ req.user:", req.user); // Kiểm tra log user

    const orderCode = generateOrderCode();

    const order = {
      amount: 10000,
      description: "Thanh toán VIP",
      orderCode: orderCode,
      returnUrl: `${YOUR_DOMAIN}`,
      cancelUrl: `${YOUR_DOMAIN}/cancel`,
    };

    const paymentLink = await payos.createPaymentLink(order);

    // Sử dụng req.user.user_id thay vì req.user.id
    await db.Payment.create({
      user_id: req.user.user_id,
      amount: order.amount,
      status: "success",
      order_code: orderCode,
    });

    res.json({ checkoutUrl: paymentLink.checkoutUrl });
  } catch (error) {
    console.error("Error creating payment link:", error);
    res.status(500).json({ message: "Error creating payment link" });
  }
});

app.get("/receive-hook", (req, res) => {
  return res.sendStatus(200);
});

// Thực sự xử lý POST
app.post("/receive-hook", async (req, res) => {
  try {
    console.log("vao roi");

    console.log("Webhook received:", req.body);
    const { orderCode } = req.body.data;
    console.log("Order code:", orderCode);

    if (!orderCode)
      return res.status(400).json({ message: "Order code is missing" });

    const payment = await db.Payment.findOne({
      where: { order_code: orderCode },
    });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    await payment.update({ status: "success" });
    const user = await db.User.findOne({ where: { user_id: payment.user_id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ is_vip: 1 });
    return res.status(200).json({ message: "User upgraded to VIP" });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

io.on("connection", socketService.connection);

server.listen(port, () => {
  console.log(`Backend Duolingo listening on http://localhost:${port}`);
});
