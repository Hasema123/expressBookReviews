const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

var users = [];

const isValid = (username) => {
    //Return true if any user with the same username is found, otherwise false
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => {
    //already logged in?
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "You did either not enter a username or did not enter a password." });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check if you entered the right username and password." });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let reqISBN = req.params.isbn;
    let reqReview = req.body.review;
    let user = req.session.authorization.username;
    let message = "";

    let book = books[reqISBN];
    let reviews = book.reviews;
    if (typeof(reviews[user]) === "undefined") {
        message = `Hey user ${user}, your review was added to the reviews of the book with the ISBN ${reqISBN}.`;
    }
    else {
        message = `Hey user ${user}, you updated your review of the book with the ISBN ${reqISBN}.`;
    }
    reviews[user] = reqReview;
    book.reviews = reviews;
    books[reqISBN] = book;

    res.send(message);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    let reqISBN = req.params.isbn;
    let user = req.session.authorization.username;
    let message = "";

    let book = books[reqISBN];
    let reviews = book.reviews;
    let newReviews = {};
    if (typeof(reviews[user]) === "undefined") {
        message = `Hey user ${user}, you never reviewed the book with the ISBN ${reqISBN}.`;
    }
    else {
        message = `Hey user ${user}, your review of the book with the ISBN ${reqISBN} was deleted.`;
        for (const [key, value] of Object.entries(reviews)) {
            if (key != user) {
                newReviews[key] = value;
            }
        }
        book.reviews = newReviews;
        books[reqISBN] = book;
        console.log(books);
    }

    res.send(message);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
