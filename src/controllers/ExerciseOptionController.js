const exerciseOptionService = require("../services//exerciseOptionService");
const db = require("~/models");
const BaseController = require("./BaseController");

class ExerciseOptionController extends BaseController {
  constructor() {
    super("exerciseOption");
  }
}

module.exports = new ExerciseOptionController();
