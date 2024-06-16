const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   //Write your code here
//   return res.send(JSON.stringify(books,null,10));
// });

// GET endpoint to retrieve the list of books
public_users.get('/', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000'); // Replace with your server's endpoint
   console.log("**************",response)
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching books:', error.message);
    return res.status(500).json({ message: 'Failed to fetch books' });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  // Create a Promise to fetch book details
  const fetchBookDetails = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject(new Error("Book not found"));
    }
  });

  // Handle Promise resolution
  fetchBookDetails
    .then((book) => {
      res.status(200).send(`Here is your Book INFO ${JSON.stringify(book)}`);
    })
    .catch((error) => {
      res.status(404).json({ message: error.message });
    });
});
  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author.toLowerCase();
  
  try {
    // Simulating fetching data using Axios (replace with actual API call if needed)
    const response = await axios.get('http://example.com/api/books'); // Replace with your API endpoint
    const books = response.data.books; // Assuming the API response has a books array

    // Filter books by author
    const filteredBooks = books.filter(book => book.author.toLowerCase() === author);

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    console.error('Error fetching books:', error.message);
    return res.status(500).json({ message: 'Failed to fetch books' });
  }
});

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase();

  findBooksByTitle(title)
    .then(filteredBooks => {
      if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
      } else {
        res.status(404).json({ message: "No books found with this title" });
      }
    })
    .catch(error => {
      console.error('Error fetching books:', error.message);
      res.status(500).json({ message: 'Failed to fetch books' });
    });
});

// Function to find books by title (simulating async operation)
function findBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    try {
      // Simulating fetching data from booksdb.js (replace with actual logic)
      const filteredBooks = Object.values(books).filter(book => book.title.toLowerCase() === title);
      resolve(filteredBooks);
    } catch (error) {
      reject(error);
    }
  });
}


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "No reviews found for this book" });
  }
});

module.exports.general = public_users;
