const express = require("express");
const { Author } = require("../models/author");
const { Book } = require("../models/book");

const router = express.Router();

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

router.get("/byName/:name", async (req, res) => {
  // const regExp = new RegExp(".*")
  let books = await Book.find({
    name: { $regex: req.params.name, $options: "i" },
  })
    .populate("authors", "name _id")
    .populate("genres", "_id name");

  if (req.query.latitude && req.query.longitude) {
    const searchLocation = {
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    books = books.sort(
      (book1, book2) =>
        distanceFrom(book1.location, searchLocation) -
        distanceFrom(book2.location, searchLocation)
    );
  }

  res.send(books);
});

router.get("/byGenre/:genreId", async (req, res) => {
  let books = await Book.find({ genres: { $in: [req.params.genreId] } })
    .populate("genres", "_id name")
    .populate("authors", "name -_id")
    .limit(10);

  if(req.query.latitude && req.query.longitude) {
    const searchLocation = {
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    books = books.sort(
      (book1, book2) =>
        distanceFrom(book1.location, searchLocation) -
        distanceFrom(book2.location, searchLocation)
    );
  }

  res.send(books);
});

function isValidObjectId(objectId) {
  return objectId.match(/^[0-9a-fA-F]{24}$/);
}

router.get("/byAuthor/:authorId", async (req, res) => {
  const isValidId = isValidObjectId(req.params.authorId);
  if (!isValidId) return res.status(400).send("Invalid ID");

  let books = await Book.find({ authors: req.params.authorId })
    .populate("authors", "name")
    .populate("genres", "_id name");

  if (req.query.latitude && req.query.longitude) {
    const searchLocation = {
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    books = books.sort(
      (book1, book2) =>
        distanceFrom(book1.location, searchLocation) -
        distanceFrom(book2.location, searchLocation)
    );
  }

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
      books = books.filter(book => book.genres.some(genre => { 
        return genre._id == req.body.genres[i];
      }));
    }
  }

  if(req.body.tags.length >= 1 && req.body.tags[0].length >= 1) {
    for (let i = 0; i < req.body.tags.length; i++) {
      books = books.filter((book) => book.tags.includes(req.body.tags[i]));
    }
  }

  if (req.query.latitude && req.query.longitude) {
    const searchLocation = {
      latitude: req.query.latitude,
      longitude: req.query.longitude,
    };

    books = books.sort(
      (book1, book2) =>
        distanceFrom(book1.location, searchLocation) -
        distanceFrom(book2.location, searchLocation)
    );
  }

  return res.send(books);
});

module.exports = router;
