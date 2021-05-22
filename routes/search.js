const express = require("express");
const { Author } = require("../models/author");
const { Book } = require("../models/book");

const router = express.Router();

router.get("/byName/:name", async (req, res) => {
  const books = await Book.find({ name: req.params.name });
  res.send(books);
});

router.get("/byGenre/:genreId", async (req, res) => {
  const books = await Book.find({ genreId: req.params.genreId });
  res.send(books);
});

router.get("/byAuthor/:authorName", async (req, res) => {
  const author = await Author.findOne({ name: req.params.authorName });
  if(!author) {
    return res.status(400).send("No author with the given name was found");
  }

  const books = await Book.find({ authorId: author._id });
  res.send(books);
});

module.exports = router;