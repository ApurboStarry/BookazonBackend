const Joi = require("joi");
const mongoose = require("mongoose");
Joi.objectId = require("joi-objectid");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 255,
    unique: true,
  },
  children: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Genre",
    },
  ],
  parent: {
    type: Boolean
  },
});

const Genre = mongoose.model("Genre", genreSchema);

function validateGenre(genre) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required()
  });

  return schema.validate(genre);
}

exports.Genre = Genre;
exports.validate = validateGenre;
