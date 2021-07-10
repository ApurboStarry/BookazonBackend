const path = require("path");
const firebase = require("firebase/app");
const fs = require("fs");
require("firebase/storage");
global.XMLHttpRequest = require("xhr2");

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxRHp9EQokCZ25rTnO0Ked9o780x41Bxk",
  authDomain: "bookazon-8266b.firebaseapp.com",
  projectId: "bookazon-8266b",
  storageBucket: "bookazon-8266b.appspot.com",
  messagingSenderId: "653929796433",
  appId: "1:653929796433:web:7467e79eca77fd586f7970",
  measurementId: "G-6FS4Z298NW",
};

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
