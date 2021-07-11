const express = require("express");
const { Author } = require("../models/author");
const { Book } = require("../models/book");

const router = express.Router();

router.get("/byName/:name", async (req, res) => {
  // const regExp = new RegExp(".*")
  const books = await Book.find({
    name: { $regex: req.params.name, $options: "i" },
  })
    .populate("authors", "name _id")
    .populate("genres", "_id name");
  res.send(books);
});

router.get("/byGenre/:genreId", async (req, res) => {
  const books = await Book.find({ genres: { $in: [req.params.genreId] } })
    .populate("genres", "_id name")
    .populate("authors", "name -_id")
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
    .populate("authors", "name")
    .populate("genres", "_id name");
  res.send(books);
});

async function getAuthorIds(authorName) {
  const authors = await Author.find({
    name: { $regex: authorName, $options: "i" },
  }).select("_id");
  
  const authorIds = [];
  for(let i = 0; i < authors.length; i++) {
    authorIds.push(authors[i]._id);
  }

  return authorIds;
}

router.post("/advancedSearch", async (req, res) => {
  const authorIds = await getAuthorIds(req.body.author);

  if(req.body.minPrice < 0) {
    req.body.minPrice = 0;
  }
  if(req.body.maxPrice > 10000 || req.body.maxPrice <= 0) {
    req.body.maxPrice = 10000
  }

  let books = await Book.find({ authors: { $in: authorIds } })
    .populate("authors", "name -_id")
    .populate("sellerId", "_id username")
    .populate("genres", "_id name");

  books = books.filter((book) => {
    return (
      book.name.match(new RegExp(req.body.name, "i")) &&
      book.unitPrice >= req.body.minPrice &&
      book.unitPrice <= req.body.maxPrice
    );
  });

  for(let i = 0; i < req.body.genres.length; i++) {
    if(req.body.genres[i] !== "") {
      books = books.filter(book => book.genres.includes(req.body.genres[i]));
    }
  }

  if(req.body.tags.length >= 1 && req.body.tags[0].length >= 1) {
    for (let i = 0; i < req.body.tags.length; i++) {
      books = books.filter((book) => book.tags.includes(req.body.tags[i]));
    }
  }

  return res.send(books);
});

module.exports = router;
