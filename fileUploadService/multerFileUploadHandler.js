const multer = require("multer");

function removeSpacesInFilename(filename) {
  const modifiedFilename = filename.replace(/ /g, "_");
  return modifiedFilename;
}

const storage = multer.diskStorage({
  destination: "uploadedFiles/",
  filename: (req, file, cb) => {
    file.originalname = removeSpacesInFilename(file.originalname);
    cb(null, req.user._id + file.originalname);
  },
});

const upload = multer({ storage: storage }).array("images", 10);

module.exports = upload;
