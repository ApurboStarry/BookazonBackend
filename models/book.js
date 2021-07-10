const Joi = require("joi");
Joi.objectId = require("joi-objectid");
const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    min: -90,
    max: 90,
    required: true,
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180,
    required: true,
  },
});

const bookSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 3,
    max: 255,
    required: true,
  },
  genres: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Genre",
    },
  ],
  quantity: {
    type: Number,
    min: 1,
    max: 2000,
    required: true,
  },
  unitPrice: {
    type: Number,
    min: 0,
    max: 10000,
    required: true,
  },
  authors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
    },
  ],
  bookCondition: {
    type: String,
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  tags: [
    {
      type: String,
      min: 3,
      max: 255,
    },
  ],
  description: { 
    type: String
  },
  images: [{ type: String }],
  location: locationSchema,
});

const Book = mongoose.model("Book", bookSchema);

function validateBook(book) {
  const locationSchema = Joi.object().keys({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  });

  const schema = Joi.object({
    name: Joi.string().required(),
    genres: Joi.array().items(Joi.string().required()),
    quantity: Joi.number().required(),
    unitPrice: Joi.number().required(),
    authors: Joi.array().items(Joi.string().min(3).max(255).required()),
    bookCondition: Joi.string().valid("used", "unused").required(),
    tags: Joi.array().items(Joi.string().min(3).max(255)),
    description: Joi.string().allow(""),
    location: locationSchema,
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
