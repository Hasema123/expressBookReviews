const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "You did either not enter a username or did not enter a password." });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  let bookPromise = new Promise((resolve, reject) => {
    resolve(JSON.stringify(books, null, 4));
  })
  bookPromise.then((books) => { res.send(books); })
})

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  let reqISBN = req.params.isbn;
  let certainBookPromise = new Promise((resolve, reject) => {
    if(typeof(books[reqISBN])!=="undefined")
      {resolve();}
    else
      {reject()}
  })

  function onFulfilled(){
    res.send(JSON.stringify(books[reqISBN], null, 4));
  }
  function onRejected(){
    res.status(404).json({message: `It was not possible to identify a book with the ISBN you entered (${reqISBN}).`});
  }

  certainBookPromise.then(onFulfilled, onRejected);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  let reqAuthor = req.params.author;
  reqAuthor = reqAuthor.replaceAll('_', ' ')
  let bookByAuthor;
  let certainBookPromise2 = new Promise((resolve, reject) => {
    for (let i = 1; i <= 10; i++) {
      if (books[i].author == reqAuthor)
        {bookByAuthor = books[i]; resolve();}
      if ((i == 10) && (books[i].author != reqAuthor))
        {reject();}
    }
  })
  function onFulfilled(){
    res.send(JSON.stringify(bookByAuthor, null, 4));
  }
  function onRejected(){
    res.status(404).json({message: "There is no book stored by this author."});
  }
  certainBookPromise2.then(onFulfilled, onRejected);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  let reqTitle = req.params.title;
  reqTitle = reqTitle.replaceAll('_', ' ');
  let bookByTitle;

  let certainBookPromise3 = new Promise((resolve, reject) => {
    var loopTitle = "";
    for (let i = 1; i <= 10; i++) {
      loopTitle = books[i].title;
      loopTitle = loopTitle.replaceAll('_', ' ');
      if (loopTitle == reqTitle) {
        bookByTitle = books[i];
        resolve();
      }
      if ((i == 10) && (loopTitle != reqTitle)) {
        reject();
      }
    }
  })
  function onFulfilled(){
    return res.send(JSON.stringify(bookByTitle, null, 4));
  }
  function onRejected(){
    res.status(404).json({ message: "There is no book with this title stored." });
  }
  certainBookPromise3.then(onFulfilled, onRejected);
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  let reqISBN = req.params.isbn;
  res.send(JSON.stringify(books[reqISBN].reviews, null, 4));
});

module.exports.general = public_users;
