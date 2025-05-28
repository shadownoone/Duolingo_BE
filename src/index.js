require("module-alias/register");
require("dotenv").config();

const db = require("~/models");
const passport = require("passport");
const fileUpload = require("express-fileupload");
const PayOS = require("@payos/node");
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

const fs = require("fs");
const speech = require("@google-cloud/speech");

const client = new speech.SpeechClient();

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

process.env.GOOGLE_APPLICATION_CREDENTIALS =
  "my-project-datn-461008-82dd9dff49ae.json";

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

const TEMP_DIR = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

app.post("/api/v1/assess-speech", async (req, res) => {
  try {
    // 1. Kiểm tra upload
    if (!req.files?.audio) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }
    const audioFile = req.files.audio;
    const expectedText = req.body.expectedText;
    if (!expectedText) {
      return res.status(400).json({ error: "expectedText is required" });
    }
    if (!audioFile.mimetype.startsWith("audio/")) {
      return res.status(400).json({ error: "File must be an audio file" });
    }

    // 2. Lưu file tạm
    const tempName = `audio_${Date.now()}.webm`;
    const tempPath = path.join(TEMP_DIR, tempName);
    await audioFile.mv(tempPath);

    // 3. Đọc file và encode base64
    const audioBytes = fs.readFileSync(tempPath).toString("base64");

    // 4. Gọi Google Speech-to-Text
    const [response] = await client.recognize({
      audio: { content: audioBytes },
      config: {
        encoding: "WEBM_OPUS",
        languageCode: "en-US",
        enableAutomaticPunctuation: true,
        model: "latest_long",
      },
    });

    // Xóa file tạm
    fs.unlinkSync(tempPath);

    // 5. Lấy transcript (chuỗi)
    const alt = response.results?.[0]?.alternatives?.[0] || {};
    const transcript = alt.transcript?.trim() || "";

    // 6. So sánh full-string
    const clean = (str) =>
      str
        .toLowerCase()
        .replace(/[^a-z]/g, "")
        .trim();
    const joinedTranscript = clean(transcript);
    const joinedExpected = clean(expectedText);

    // Đúng nếu transcript đúng hẳn, hoặc chứa expected làm substring
    const isCorrect =
      joinedTranscript === joinedExpected ||
      joinedTranscript.includes(joinedExpected);
    const accuracy = isCorrect ? 1 : 0;

    // 7. Trả về kết quả
    res.json({
      transcript,
      overallConfidence: alt.confidence ?? 0,
      accuracy,
      isCorrect,
    });
  } catch (err) {
    console.error("Speech-to-text error:", err);
    res.status(500).json({
      error: "Speech-to-text error",
      details: err.message,
    });
  }
});

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
