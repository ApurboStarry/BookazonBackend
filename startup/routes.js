const express = require("express");

const users = require("../routes/users");
const auth = require("../routes/auth");
const genres = require("../routes/genres");
const authors = require("../routes/authors");
const books = require("../routes/books");
const search = require("../routes/search");
const buy = require("../routes/buy");
const cart = require("../routes/cart");

const error = require("../middlewares/error");

module.exports = function (app) {
  app.use(express.json());

  app.use("/asdf", (req, res) => {
    res.send("Hello world");
  })
  
  app.use("/api/v1/users", users);
  app.use("/api/v1/auth", auth);
  app.use("/api/v1/genres", genres);
  app.use("/api/v1/authors", authors);
  app.use("/api/v1/books", books);
  app.use("/api/v1/search", search);
  app.use("/api/v1/buy", buy);
  app.use("/api/v1/cart", cart);

  app.use(error);
};
