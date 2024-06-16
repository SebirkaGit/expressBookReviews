const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js"); // Assuming booksdb.js is in the parent directory
const regd_users = express.Router();

let users = []; // Array to store registered users

const isValid = (username) => {
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(user => user.username === username && user.password === password);
};

// Register endpoint
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered." });
});

// Login endpoint
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Middleware to authenticate access to protected routes
regd_users.use("/books", function auth(req, res, next) {
  if (req.session.authorization && req.session.authorization.accessToken) {
    const token = req.session.authorization.accessToken;

    jwt.verify(token, "access", (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Failed to authenticate token." });
      } else {
        req.user = decoded; // Assuming decoded contains the username or user data
        next();
      }
    });
  } else {
    return res.status(403).json({ message: "User not authenticated." });
  }
});

// Add a book review endpoint
regd_users.put("/auth/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  let book = books[isbn];

  if (book) {
    let review = req.body.review;
    if (review) {
      book.reviews = book.reviews || {}; // Initialize reviews if not already present
      book.reviews[req.user.username] = review; // Assuming req.user contains username
    }

    books[isbn] = book;
    res.send(`Book with ISBN ${isbn} updated with review.`);
  } else {
    res.status(404).send("Unable to find book.");
  }
});


// Endpoint to delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Get username from session

  // Check if the book exists
  if (books[isbn]) {
    // Check if the book has reviews and if the user has reviewed it
    if (books[isbn].reviews && books[isbn].reviews[username]) {
      // Delete the review
      delete books[isbn].reviews[username];
      res.status(200).json({ message: `Review for book with ISBN ${isbn} deleted successfully` });
    } else {
      res.status(404).json({ message: `No review found for book with ISBN ${isbn}` });
    }
  } else {
    res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
