const { Author } = require("../models/author")

async function getAuthorId(authorName) {
  let author = await Author.findOne({ name: authorName });
  if(author) {
    return author._id;
  }

  author = new Author({
    name: authorName
  });

  author = await author.save();
  return author._id;
}

module.exports = {
  getAuthorId: getAuthorId
}