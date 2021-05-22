const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    min: 5,
    max: 255,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    min: 4,
    max: 255,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 5,
    max: 1024,
  },
  isAdmin: {
    type: Boolean,
    required: true,
  }
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, email: this.email },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    username: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(8).max(255).required(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;
