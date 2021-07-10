const express = require("express");
const auth = require("../middlewares/auth");

const { Transaction, validate, validateTransactionForUpdation } = require("../models/transaction");
const { Cart } = require("../models/cart");
const { BooksInCart } = require("../models/booksInCart");
const { Book } = require("../models/book");

const router = express.Router();

function isValidObjectId(objectId) {
  return objectId.match(/^[0-9a-fA-F]{24}$/);
}

async function decreaseQuantityOfSoldBooks(userId) {
  const cart = await Cart.findOne({ ownerId: userId });
  for(let i = 0; i < cart.books.length; i++) {
    const booksInCart = await BooksInCart.findOne({ _id: cart.books[i] });
    let book = await Book.findOne({ _id: booksInCart.bookId });
    book = await Book.findOneAndUpdate(
      { _id: booksInCart.bookId },
      { quantity: book.quantity - booksInCart.quantity },
      { new: true }
    )
  }
}

router.get("/transactionHistory", auth, async (req, res) => {
  const transactions = await Transaction.find({
    buyerId: req.user._id,
  }).populate({
    path: "books",
    populate: {
      path: "bookId",
    },
  });
  return res.send(transactions);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const cart = await Cart.findOne({ ownerId: req.user._id });
  if(!cart) {
    return res.status(400).send("No items in cart");
  }

  let transaction = new Transaction({
    books: cart.books,
    totalAmount: req.body.totalAmount,
    paymentMethod: req.body.paymentMethod,
    deliveryType: req.body.deliveryType,
    deliveryAddress: req.body.deliveryAddress,
    buyerId: req.user._id,
    transactionDate: Date.now(),
    transactionRating: 0
  });

  transaction = await transaction.save();
  await decreaseQuantityOfSoldBooks(req.user._id);
  await Cart.findOneAndDelete({ ownerId: req.user._id });

  return res.send({ _id: transaction._id, totalAmount: transaction.totalAmount });
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
