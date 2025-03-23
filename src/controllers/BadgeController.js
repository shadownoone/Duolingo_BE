const badgeService = require("../services/BadgeService");
const BaseController = require("./BaseController");

class BadgeController extends BaseController {
  constructor() {
    super("badge");
  }

  // GET API
  get = async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 10;

    const data = await badgeService.find({
      page: page,
      pageSize: pageSize,

      raw: false,
    });

    if (data.code === -1) {
      return res.status(500).json(data);
    }

    return res.status(200).json(data);
  };
}

module.exports = new BadgeController();
