const express = require("express");

const { Book, validate, validateBookForUpdation } = require("../models/book");

const authorService = require("../services/authorService");
const auth = require("../middlewares/auth");

const router = express.Router();

const pageSize = 5;

function isValidObjectId(objectId) {
  return objectId.match(/^[0-9a-fA-F]{24}$/);
}

async function getNumberOfPages() {
  const numberOfBooks = await Book.countDocuments();
  const numberOfPages = Math.floor(numberOfBooks / pageSize) + 1;

  return numberOfPages;
}

// router.get("/", async (req, res) => {
//   const books = await Book.find({ })
//     .sort("name")
//     .limit(20)
//     .select("-__v");

//   res.send(books);
// });

router.get("/", async (req, res) => {
  const pageNumber = req.query.pageNumber;
  const numberOfPages = await getNumberOfPages();
  if(!pageNumber || pageNumber < 1 || pageNumber > numberOfPages) {
    return res.status(400).send("Invalid page number");
  }

  const books = await Book.find()
    .populate("authors", "name")
    .populate("genreId", "name")
    .populate("sellerId", "_id username")
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);

  res.send(books);
})

router.get("/sortBy/name", async (req, res) => {
  const state = req.query.order === "ascending" ? 1 : -1;
  const books = await Book.find()
    .populate("authors", "name")
    .populate("genreId", "name")
    .populate("sellerId", "_id username")
    .sort({ name: state })
    .limit(10);

  res.send(books);
});

router.get("/sortBy/unitPrice", async (req, res) => {
  const state = req.query.order === "ascending" ? 1 : -1;
  const books = await Book.find()
    .populate("authors", "name")
    .populate("genreId", "name")
    .populate("sellerId", "_id username")
    .sort({ unitPrice: state })
    .limit(10);

  res.send(books);
});

router.get("/sortBy/genre", async (req, res) => {
  const state = req.query.order === "ascending" ? 1 : -1;
  const books = await Book.find()
    .populate("authors", "name")
    .populate("genreId", "name -_id")
    .populate("sellerId", "_id username")
    .sort({ genreId: state })
    .limit(10);

  res.send(books);
});

router.get("/numberOfPages", async (req, res) => {
  const numberOfPages = await getNumberOfPages();

  res.send(numberOfPages.toString());
})

router.get("/getBook/:id", async (req, res) => {
  const isValidId = isValidObjectId(req.params.id);
  if (!isValidId) return res.status(400).send("Invalid ID");

  const book = await Book.findOne({ _id: req.params.id })
    .populate("genreId sellerId authors");

  if (!book) {
    return res.status(404).send("No book with the given ID was found");
  }

  return res.send({
    _id: book._id,
    name: book.name,
    authors: book.authors,
    genre: book.genreId.name,
    unitPrice: book.unitPrice,
    quantity: book.quantity,
    seller: book.sellerId.username,
  });
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let book = await Book.find({ name: req.body.name, sellerId: req.user._id });
  
  if(book.length > 0) {
    return res.status(400).send("A book with the given name already exists. Try updating the existing book");
  }

  const bookAuthors = [];
  for(let i = 0; i < req.body.authors.length; i++) {
    // if authorName is already in the database, just returns the _id of the author
    // otherwise creates a new author with "authorName" and returns the _id
    const authorId = await authorService.getAuthorId(req.body.authors[i]);

    bookAuthors.push(authorId);
  }

  book = new Book({
    name: req.body.name,
    genreId: req.body.genreId,
    quantity: req.body.quantity,
    unitPrice: req.body.unitPrice,
    authors: bookAuthors,
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
