const Joi = require("joi");
const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 255,
    unique: true,
  },
});

const Author = mongoose.model("Author", authorSchema);

function validateAuthor(author) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
  });

  return schema.validate(author);
}

exports.Author = Author;
exports.validate = validateAuthor;
