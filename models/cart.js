const Joi = require("joi");
Joi.objectId = require("joi-objectid");
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: "BooksInCart" }],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const Cart = mongoose.model("Cart", cartSchema);

function validateCart(cart) {
  const schema = Joi.object({
    bookId: Joi.string().required(),
    quantity: Joi.number().min(1).max(200).required(),
    unitPrice: Joi.number().min(0).max(10000).required(),
  });

  return schema.validate(cart);
}

module.exports.Cart = Cart;
module.exports.validate = validateCart;
