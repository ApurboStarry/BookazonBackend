const Joi = require("joi");
Joi.objectId = require("joi-objectid");
const mongoose = require("mongoose");

const booksInCartSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
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
  totalAmount: {
    type: Number,
    min: 1,
    required: true,
  },
});

const BooksInCart = mongoose.model("BooksInCart", booksInCartSchema);

function validateBooksInCart(cart) {
  const schema = Joi.object({
    bookId: Joi.string().required(),
    quantity: Joi.number().min(1).max(200).required(),
    unitPrice: Joi.number().min(1).max(10000).required(),
  });

  return schema.validate(cart);
}

module.exports.BooksInCart = BooksInCart;
module.exports.validate = validateBooksInCart;
