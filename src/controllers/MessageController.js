const messageService = require("../services/messageService");
const db = require("~/models");

const BaseController = require("./BaseController");

class MessageController extends BaseController {
  constructor() {
    super("Message");
  }
}

module.exports = new MessageController();
