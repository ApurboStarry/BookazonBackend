const Joi = require("joi");
Joi.objectId = require("joi-objectid");
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  genres: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Genre",
  }],
  quantity: {
    type: Number,
    min: 1,
    max: 200,
    required: true,
  },
  unitPrice: {
    type: Number,
    min: 1,
    max: 10000,
    required: true,
  },
  authors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
  }],
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tags: [{
    type: String,
    min: 3,
    max: 255
  }]
});

const Book = mongoose.model("Book", bookSchema);

function validateBook(book) {
  const schema = Joi.object({
    name: Joi.string().required(),
    genres: Joi.array().items(Joi.string().required()),
    quantity: Joi.number().required(),
    unitPrice: Joi.number().required(),
    authors: Joi.array().items(Joi.string().min(3).max(255).required()),
    tags: Joi.array().items(Joi.string().min(3).max(255)),
  });

  return schema.validate(book);
}

function validateBookForUpdation(book) {
  const schema = Joi.object({
    quantity: Joi.number().min(1).required(),
    unitPrice: Joi.number().min(1).required(),
  });

  return schema.validate(book);
}

module.exports.Book = Book;
module.exports.validate = validateBook;
module.exports.validateBookForUpdation = validateBookForUpdation;
