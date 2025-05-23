const paymentService = require("../services/paymentService");
const BaseController = require("./BaseController");
const db = require("~/models");

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
}

module.exports = new PaymentController();
