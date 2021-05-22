const express = require("express");

const { Transaction, validate, validateTransactionForUpdation } = require("../models/transaction");
const { Book } = require("../models/book");

const auth = require("../middlewares/auth");

const router = express.Router();

function isValidObjectId(objectId) {
  return objectId.match(/^[0-9a-fA-F]{24}$/);
}

router.post("/", auth, async (req, res) => {
  const isValidId = isValidObjectId(req.body.bookId);
  if (!isValidId) return res.status(400).send("Invalid ID");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let book = await Book.findOne({ _id: req.body.bookId });
  if(book.quantity <= 0) {
    return res.status(400).send("Book doesn't exist");
  }

  await Book.findOneAndUpdate(
    {
      _id: req.body.bookId
    },
    {
      quantity: book.quantity - 1
    }
  );

  let transaction = new Transaction({
    bookId: req.body.bookId,
    buyerId: req.user._id,
    quantity: req.body.quantity,
    unitPrice: req.body.unitPrice,
    totalAmount: req.body.quantity * req.body.unitPrice,
    transactionDate: Date.now(),
    transactionRating: 0
  });

  transaction = await transaction.save();

  res.send({ _id: transaction._id, totalAmount: transaction.totalAmount });
});

router.put("/rate/:transactionId", auth, async (req, res) => {
  const isValidId = isValidObjectId(req.params.transactionId);
  if (!isValidId) return res.status(400).send("Invalid ID");

  const { error } = validateTransactionForUpdation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const transaction = await Transaction.findOneAndUpdate(
    {
      _id: req.params.transactionId,
      buyerId: req.user._id
    },
    {
      transactionRating: req.body.transactionRating
    },
    {
      new: true,
    }
  );
  if (!transaction) {
    return res.status(404).send("No transaction with the given ID was found");
  }

  res.send({
    _id: transaction._id,
    transactionRating: transaction.transactionRating,
  });
});

module.exports = router;
