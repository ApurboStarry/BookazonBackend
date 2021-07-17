const config = require("config");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const express = require("express");
const auth = require("../middlewares/auth");

const router = express.Router();

router.get("/isAdmin", auth, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  return res.send(user.isAdmin);
})

// for login
router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("Invalid email or password");
  }

  const isValidPassword = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isValidPassword) {
    return res.status(400).send("Invalid email or password");
  }

  const token = user.generateAuthToken();
  res.send(token);
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).max(255).required(),
  });

  return schema.validate(req);
}

module.exports = router;
