const express = require("express");

const { User } = require("../models/user");
const { Author, validate } = require("../models/author");

const auth = require("../middlewares/auth");

const router = express.Router();

function isValidObjectId(objectId) {
  return objectId.match(/^[0-9a-fA-F]{24}$/);
}

router.get("/", async (req, res) => {
  const authors = await Author.find({});

  res.send(authors);
});

router.get("/:id", async (req, res) => {
  const isValidId = isValidObjectId(req.params.id);
  if (!isValidId) return res.status(400).send("Invalid ID");

  const author = await Author.findOne({
    _id: req.params.id,
  });
  if (!author) {
    return res.status(404).send("No author with the given ID was found");
  }

  return res.send({
    _id: author._id,
    name: author.name,
  });
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check user is an admin
  const isUserAnAdmin = await isAdmin(req.user._id);
  if (!isUserAnAdmin) {
    return res.status(401).send("Unauthorized to access");
  }

  let author = new Author({
    name: req.body.name,
  });

  author = await author.save();

  res.send({ _id: author._id, url: author.url });
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const isValidId = isValidObjectId(req.params.id);
  if (!isValidId) return res.status(400).send("Invalid ID");

  // check user is an admin
  const isUserAnAdmin = await isAdmin(req.user._id);
  if (!isUserAnAdmin) {
    return res.status(401).send("Unauthorized to access");
  }

  const author = await Author.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    {
      name: req.body.name,
    },
    {
      new: true,
    }
  );
  if (!author) {
    return res.status(404).send("No author with the given ID was found");
  }

  res.send({
    _id: author._id,
    name: author.name,
  });
});

router.delete("/:id", auth, async (req, res) => {
  const isValidId = isValidObjectId(req.params.id);
  if (!isValidId) return res.status(400).send("Invalid ID");

  // check user is an admin
  const isUserAnAdmin = await isAdmin(req.user._id);
  if (!isUserAnAdmin) {
    return res.status(401).send("Unauthorized to access");
  }

  let author = await Author.findOne({
    _id: req.params.id,
  });
  if (!author) {
    return res.status(400).send("No author with the given ID was found");
  }

  author = await Author.findOneAndRemove({ _id: req.params.id });
  res.send({
    _id: author._id,
    name: author.name,
  });
});

async function isAdmin(userId) {
  // check if the requesting user is an admin
  const user = await User.findOne({ _id: userId });
  if (!user.isAdmin) {
    return false;
  }

  return true;
}

module.exports = router;
