const paymentService = require("../services/paymentService");
const BaseController = require("./BaseController");
const db = require("~/models");
const { Op, fn, col, literal } = require("sequelize");
class PaymentController extends BaseController {
  constructor() {
    super("payment");
  }

  getPayments = async (req, res) => {
    try {
      const totalPayments = await db.Payment.sum("amount");

      // Trả về kết quả dưới dạng JSON
      return res.status(200).json({
        code: 0,
        message: "Success",
        data: {
          totalPayments,
        },
      });
    } catch (error) {
      // Xử lý lỗi nếu có
      return res.status(500).json({
        code: -1,
        message: error.message,
      });
    }
  };

  getUserTotalPayments = async (req, res) => {
    try {
      const results = await db.Payment.findAll({
        attributes: ["user_id", [fn("SUM", col("amount")), "totalAmount"]],
        include: [
          {
            model: db.User,
            as: "user",
            attributes: ["user_id", "username", "avatar"],
          },
        ],
        group: [
          "Payment.user_id",
          "user.user_id",
          "user.username",
          "user.avatar",
        ],
        // Thay thứ tự sắp xếp:
        order: [
          // Sắp giảm dần theo alias "totalAmount"
          [literal("totalAmount"), "DESC"],
        ],
        raw: false,
      });

      const data = results.map((row) => ({
        user_id: row.user_id,
        username: row.user.username,
        avatar: row.user.avatar,
        totalAmount: row.get("totalAmount"),
      }));

      return res.status(200).json({
        code: 0,
        message: "Success",
        data,
      });
    } catch (err) {
      console.error("Error in getUserTotalPayments:", err);
      return res.status(500).json({
        code: -1,
        message: err.message,
      });
    }
  };
}

module.exports = new PaymentController();
