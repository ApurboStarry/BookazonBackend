const express = require("express");
const auth = require("../middlewares/auth");

const { Book } = require("../models/book");
const { Cart } = require("../models/cart");
const { BooksInCart, validate } = require("../models/booksInCart");

const router = express.Router();

function isValidObjectId(objectId) {
  return objectId.match(/^[0-9a-fA-F]{24}$/);
}

router.get("/allBooks", auth, async (req, res) => {
  const cart = await Cart.findOne({ ownerId: req.user._id })
    .populate({
      path: "books",
      populate: {
        path: "bookId"
      }
    });
  return res.send(cart);
});

router.post("/addBook", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check if the provided bookId(req.body.bookId) really exists
  const book = await Book.findOne({ _id: req.body.bookId });
  if (!book) {
    return res.status(400).send("No book with the given ID was found");
  }

  // create "BooksInCart"
  let booksInCart = new BooksInCart({
    bookId: req.body.bookId,
    quantity: req.body.quantity,
    unitPrice: req.body.unitPrice,
    totalAmount: req.body.quantity * req.body.unitPrice,
    images: book.images
  });

  booksInCart = await booksInCart.save();

  // find cart of the user
  let cart = await Cart.findOne({ ownerId: req.user._id });

  // if the user has no cart yet, create one
  if (!cart) {
    const books = [];
    books.push(booksInCart._id);
    cart = new Cart({
      books,
      ownerId: req.user._id,
    });

    cart = await cart.save();

    return res.send(cart);
  }

  // the user already has cart
  const books = cart.books;
  books.push(booksInCart);
  cart = await Cart.findOneAndUpdate(
    { ownerId: req.user._id },
    { books: books },
    { new: true }
  );

  return res.send(cart);
});

router.put("/updateQuantity/:booksInCartId", auth, async (req, res) => {
  const isValidId = isValidObjectId(req.params.booksInCartId);
  if (!isValidId) return res.status(400).send("Invalid ID");

  if (req.body.quantity < 1 || req.body.quantity > 200) {
    return res.status(400).send("Quantity too small or too large");
  }

  let bookInCart = await BooksInCart.findOne({ _id: req.params.booksInCartId });
  if (!bookInCart) {
    return res.status(400).send("Book doesn't exist in cart");
  }

  bookInCart = await BooksInCart.findOneAndUpdate(
    { _id: req.params.booksInCartId },
    {
      quantity: req.body.quantity,
      totalAmount: req.body.quantity * bookInCart.unitPrice,
    },
    { new: true }
  );

  return res.send(bookInCart);
});

router.delete("/deleteBook/:bookInCartId", auth, async (req, res) => {
  const isValidId = isValidObjectId(req.params.bookInCartId);
  if (!isValidId) return res.status(400).send("Invalid ID");

  // delete from "Cart" first
  // retrieve the cart associated to the user first
  let cart = await Cart.findOne({ ownerId: req.user._id });

  if (!cart) {
    return res.status(400).send("Book doesn't exist in the cart");
  }

  const books = cart.books;
  const index = books.indexOf(req.params.bookInCartId);
  if (index > -1) {
    books.splice(index, 1);
  }

  cart = await Cart.findOneAndUpdate(
    { ownerId: req.user._id },
    { books: books },
    { new: true }
  );

  await BooksInCart.findByIdAndDelete(req.params.bookInCartId);

  return res.send(cart);
});

module.exports = router;
