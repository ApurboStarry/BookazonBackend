const express = require("express");

const { Book, validate, validateBookForUpdation } = require("../models/book");

const authorService = require("../services/authorService");
const auth = require("../middlewares/auth");

const router = express.Router();

function isValidObjectId(objectId) {
  return objectId.match(/^[0-9a-fA-F]{24}$/);
}

router.get("/", async (req, res) => {
  const books = await Book.find({ })
    .sort("name");

  res.send(books);
});

router.get("/:id", async (req, res) => {
  const isValidId = isValidObjectId(req.params.id);
  if (!isValidId) return res.status(400).send("Invalid ID");

  const book = await Book.findOne({
    _id: req.params.id
  });
  if (!book) {
    return res.status(404).send("No book with the given ID was found");
  }

  return res.send({
    name: book.name,
    genreId: book.genreId,
    quantity: book.quantity,
    unitPrice: book.unitPrice,
    authorId: book.authorId,
    sellerId: book.sellerId
  });
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let book = await Book.find({ name: req.body.name, sellerId: req.user._id });
  console.log(book.length);
  if(book.length > 0) {
    return res.status(400).send("A book with the given name already exists. Try updating the existing book");
  }

  // if authorName is already in the database, just returns the _id of the author
  // otherwise creates a new author with "authorName" and returns the _id
  const authorId = await authorService.getAuthorId(req.body.authorName);

  book = new Book({
    name: req.body.name,
    genreId: req.body.genreId,
    quantity: req.body.quantity,
    unitPrice: req.body.unitPrice,
    authorId: authorId,
    sellerId: req.user._id
  });

  book = await book.save();

  res.send({ _id: book._id, name: book.name });
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validateBookForUpdation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const isValidId = isValidObjectId(req.params.id);
  if (!isValidId) return res.status(400).send("Invalid ID");

  const book = await Book.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    {
      quantity: req.body.quantity,
      unitPrice: req.body.unitPrice
    },
    {
      new: true,
    }
  );
  if (!book) {
    return res.status(404).send("The password with the given ID was not found");
  }

  res.send({
    _id: book._id,
    name: book.name
  });
});

router.delete("/:id", auth, async (req, res) => {
  const isValidId = isValidObjectId(req.params.id);
  if (!isValidId) return res.status(400).send("Invalid ID");

  let book = await Book.findOne({
    _id: req.params.id
  });
  if (!book) {
    return res.status(400).send("No book with the given ID was found");
  }

  book = await Book.findOneAndRemove({ _id: req.params.id });
  res.send({
    _id: book._id,
    name: book.name
  });
});

module.exports = router;
