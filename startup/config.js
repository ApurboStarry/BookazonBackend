const config = require("config");

module.exports = function () {
  console.log(config.get("jwtPrivateKey"));
  if (!config.get("jwtPrivateKey")) {
    console.log("FATAL ERROR: 'jwtPrivateKey' is not defined");
    throw new Error("FATAL ERROR: 'jwtPrivateKey' is not defined");
  }

  if (!config.get("db")) {
    console.log("FATAL ERROR: 'db' is not defined");
    throw new Error("FATAL ERROR: 'db' is not defined");
  }
};
