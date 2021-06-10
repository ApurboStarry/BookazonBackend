const express = require("express");
const { Author } = require("../models/author");
const { Book } = require("../models/book");

const router = express.Router();

router.get("/byName/:name", async (req, res) => {
  const books = await Book.find({ name: req.params.name });
  res.send(books);
});

router.get("/byGenre/:genreId", async (req, res) => {
  const books = await Book.find({ genreId: req.params.genreId })
    .populate("genreId", "name")
    .limit(10);
  res.send(books);
});

function isValidObjectId(objectId) {
  return objectId.match(/^[0-9a-fA-F]{24}$/);
}

router.get("/byAuthor/:authorId", async (req, res) => {
  const isValidId = isValidObjectId(req.params.authorId);
  if (!isValidId) return res.status(400).send("Invalid ID");

  const books = await Book.find({ authors: req.params.authorId })
    .populate("authorId", "name")
    .populate("genreId", "name");
  res.send(books);
});

module.exports = router;
