const express = require("express");

const { User } = require("../models/user");
const { Genre, validate } = require("../models/genre");

const auth = require("../middlewares/auth");

const router = express.Router();

function isValidObjectId(objectId) {
  return objectId.match(/^[0-9a-fA-F]{24}$/);
}

router.get("/", async (req, res) => {
  const genres = await Genre.find({  });

  res.send(genres);
});

router.get("/:id", async (req, res) => {
  const isValidId = isValidObjectId(req.params.id);
  if (!isValidId) return res.status(400).send("Invalid ID");

  const genre = await Genre.findOne({
    _id: req.params.id,
  });
  if (!genre) {
    return res.status(404).send("No genre with the given ID was found");
  }

  return res.send({
    _id: genre._id,
    name: genre.name
  });
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // check user is an admin
  const isUserAnAdmin = await isAdmin(req.user._id);
  if(!isUserAnAdmin) {
    return res.status(401).send("Unauthorized to access");
  }

  let genre = new Genre({
    name: req.body.name
  });

  genre = await genre.save();

  res.send({ _id: genre._id, url: genre.url });
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

  const genre = await Genre.findOneAndUpdate(
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
  if (!genre) {
    return res.status(404).send("No genre with the given ID was found");
  }

  res.send({
    _id: genre._id,
    name: genre.name,
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

  let genre = await Genre.findOne({
    _id: req.params.id,
  });
  if (!genre) {
    return res.status(400).send("No genre with the given ID was found");
  }

  genre = await Genre.findOneAndRemove({ _id: req.params.id });
  res.send({
    _id: genre._id,
    name: genre.name
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
