const bcrypt = require("bcryptjs");

const methodsService = require("./index");

const salt = bcrypt.genSaltSync(10);

const hashPassword = (password) => {
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

module.exports = { ...methodsService("User"), hashPassword };
