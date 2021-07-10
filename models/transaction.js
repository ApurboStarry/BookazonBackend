const Joi = require("joi");
Joi.objectId = require("joi-objectid");
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  books: [{ type: mongoose.Schema.Types.ObjectId, ref: "BooksInCart" }],
  totalAmount: {
    type: Number,
    min: 1,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true
  },
  deliveryType: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  transactionDate: {
    type: Date,
    required: true,
  },
  transactionRating: {
    type: Number,
    min: 0,
    max: 5,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

function validateTransaction(transaction) {
  const schema = Joi.object({
    totalAmount: Joi.number().min(1).required(),
    paymentMethod: Joi.string().required(),
    deliveryType: Joi.string().required(),
    deliveryAddress: Joi.string().allow("")
  });

  return schema.validate(transaction);
}

function validateTransactionForUpdation(transaction) {
  const schema = Joi.object({
    transactionRating: Joi.number().min(1).max(5).required()
  });

  return schema.validate(transaction);
}

module.exports.Transaction = Transaction;
module.exports.validate = validateTransaction;
module.exports.validateTransactionForUpdation = validateTransactionForUpdation;
