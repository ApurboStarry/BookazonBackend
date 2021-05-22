const Joi = require("joi");
Joi.objectId = require("joi-objectid");
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
    required: true
  },
  transactionDate: {
    type: Date,
    required: true
  },
  transactionRating: {
    type: Number,
    min: 0,
    max: 5
  }
});

const Transaction = mongoose.model("Transaction", transactionSchema);

function validateTransaction(transaction) {
  const schema = Joi.object({
    bookId: Joi.string().required(),
    quantity: Joi.number().min(1).max(200).required(),
    unitPrice: Joi.number().min(1).max(10000).required(),
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
