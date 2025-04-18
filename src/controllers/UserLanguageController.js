const userLanguageService = require("../services/userLanguageService");
const db = require("~/models");

const BaseController = require("./BaseController");

class UserLanguageController extends BaseController {
  constructor() {
    super("userLanguage");
  }
}

module.exports = new UserLanguageController();
