const path = require("path");
const firebase = require("firebase/app");
const fs = require("fs");
const config = require("config");

require("firebase/storage");
global.XMLHttpRequest = require("xhr2");

let firebaseAPIKey = {};

try {
  const firebaseFile = process.env.bookazon_firebaseFile;
  const rawData = fs.readFileSync(firebaseFile);
  firebaseAPIKey = JSON.parse(rawData);
} catch(e) {
  console.log("FATAL ERROR: Could not connect to firebase");
  process.exit(1);
}

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = firebaseAPIKey;

firebase.initializeApp(firebaseConfig);

const storageRef = firebase.storage().ref();

async function uploadToFirebase(userId, bookId, file) {
  const fileLocationInFirebase = bookId + "/" + file.originalname;
  const fileLocationInServer =
    path.join(__dirname, "../") + file.path;

  // first upload to firebase
  const fileRef = storageRef.child(fileLocationInFirebase); // child("file name to be created")

  const fsPromise = await fs.promises.readFile(fileLocationInServer);

  const snapshot = await fileRef.put(fsPromise.buffer);

  const url = await storageRef.child(fileLocationInFirebase).getDownloadURL();

  return new Promise((resolve, reject) => {
    resolve(url);
  });
}

module.exports = uploadToFirebase;
