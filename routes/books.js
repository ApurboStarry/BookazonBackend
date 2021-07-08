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

  if (numberOfBooks % pageSize === 0) return numberOfBooks / pageSize;
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
  if (!pageNumber || pageNumber < 1 || pageNumber > numberOfPages) {
    return res.status(400).send("Invalid page number");
  }

  const books = await Book.find()
    .populate("authors", "name")
    .populate("genres", "_id name")
    .populate("sellerId", "_id username")
    .skip((pageNumber - 1) * pageSize)
    .limit(pageSize);

  res.send(books);
});

router.get("/sortBy/name", async (req, res) => {
  const state = req.query.order === "ascending" ? 1 : -1;
  const books = await Book.find()
    .populate("authors", "name")
    .populate("genres", "_id name")
    .populate("sellerId", "_id username")
    .sort({ name: state })
    .limit(10);

  res.send(books);
});

router.get("/sortBy/unitPrice", async (req, res) => {
  const state = req.query.order === "ascending" ? 1 : -1;
  const books = await Book.find()
    .populate("authors", "name")
    .populate("genres", "_id name")
    .populate("sellerId", "_id username")
    .sort({ unitPrice: state })
    .limit(10);

  res.send(books);
});

router.get("/sortBy/genre", async (req, res) => {
  const state = req.query.order === "ascending" ? 1 : -1;
  const books = await Book.find()
    .populate("authors", "name")
    .populate("genres", "name -_id")
    .populate("sellerId", "_id username")
    .sort({ genres: state })
    .limit(10);

  res.send(books);
});

function distanceFrom(location1, location2) {
  let lat1 = location1.latitude;
  let lon1 = location1.longitude;

  let lat2 = location2.latitude;
  let lon2 = location2.longitude;

  lon1 = (lon1 * Math.PI) / 180;
  lon2 = (lon2 * Math.PI) / 180;
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;

  // Haversine formula
  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956
  // for miles
  let r = 6371;

  // calculate the result
  return c * r;
}

router.get("/sortBy/location", async (req, res) => {
  const searchLocation = {
    latitude: req.query.latitude,
    longitude: req.query.longitude,
  };

  let books = await Book.find();
  books = books.sort(
    (book1, book2) =>
      distanceFrom(book1.location, searchLocation) -
      distanceFrom(book2.location, searchLocation)
  );
  return res.send(books);
});

router.get("/numberOfPages", async (req, res) => {
  const numberOfPages = await getNumberOfPages();

  res.send(numberOfPages.toString());
});

router.get("/getBook/:id", async (req, res) => {
  const isValidId = isValidObjectId(req.params.id);
  if (!isValidId) return res.status(400).send("Invalid ID");

  const book = await Book.findOne({ _id: req.params.id })
    .populate("genres", "_id name")
    .populate("sellerId authors");

  if (!book) {
    return res.status(404).send("No book with the given ID was found");
  }

  return res.send({
    _id: book._id,
    name: book.name,
    authors: book.authors,
    bookCondition: book.bookCondition,
    genres: book.genres,
    unitPrice: book.unitPrice,
    quantity: book.quantity,
    seller: book.sellerId.username,
    tags: book.tags,
    description: book.description
  });
});

router.get("/giveaways", async (req, res) => {
  const books = await Book.find({ unitPrice: 0 })
    .limit(10)
    .populate("genres", "_id name")
    .populate("authors");

  return res.send(books);
});

function formatTags(tags) {
  const formattedTags = [];
  for (let i = 0; i < tags.length; i++) {
    formattedTags.push(tags[i].toLowerCase());
  }

  return formattedTags;
}

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let book = await Book.find({ name: req.body.name, sellerId: req.user._id });

  if (book.length > 0) {
    return res
      .status(400)
      .send(
        "A book with the given name already exists. Try updating the existing book"
      );
  }

  const bookAuthors = [];
  for (let i = 0; i < req.body.authors.length; i++) {
    // if authorName is already in the database, just returns the _id of the author
    // otherwise creates a new author with "authorName" and returns the _id
    const authorId = await authorService.getAuthorId(req.body.authors[i]);

    bookAuthors.push(authorId);
  }

  const formattedTags = formatTags(req.body.tags);

  book = new Book({
    name: req.body.name,
    genres: req.body.genres,
    quantity: req.body.quantity,
    unitPrice: req.body.unitPrice,
    authors: bookAuthors,
    bookCondition: req.body.bookCondition,
    sellerId: req.user._id,
    tags: formattedTags,
    description: req.body.description,
    location: req.body.location,
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
      unitPrice: req.body.unitPrice,
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
    name: book.name,
  });
});

router.delete("/:id", auth, async (req, res) => {
  const isValidId = isValidObjectId(req.params.id);
  if (!isValidId) return res.status(400).send("Invalid ID");

  let book = await Book.findOne({
    _id: req.params.id,
  });
  if (!book) {
    return res.status(400).send("No book with the given ID was found");
  }

  book = await Book.findOneAndRemove({ _id: req.params.id });
  res.send({
    _id: book._id,
    name: book.name,
  });
});

module.exports = router;
