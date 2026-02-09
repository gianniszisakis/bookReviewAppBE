const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(409).json({ message: "Usename already exists" });
  }

  users.push({ username, password });

  return res.send("User registered");
});

// Get the book list available in the shop
public_users.get("/", async (req, res) => {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        if (books) resolve(books);
        else reject("No books found");
      });
    };

    const bookList = await getBooks();
    res.status(200).json(bookList);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Fetching error" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    const getBookByIsbn = () => {
      return new Promise((resolve, reject) => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject("No book found");
        }
      });
    };

    const book = await getBookByIsbn();
    res.status(200).json(book);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Error in fetch isbn book" });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;

  const authorRes = Object.values(books).filter(
    (book) => book.author === author,
  );

  if (authorRes.length > 0) {
    res.send(authorRes);
  } else {
    res.status(404).json({ message: "Author not found" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;

  const titleRes = Object.values(books).filter((book) => book.title === title);

  if (titleRes.length > 0) {
    res.send(titleRes);
  } else {
    res.status(404).json({ message: "Title not found" });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (!books) {
    res.status(404).json({ message: "Book not found" });
  } else {
    res.send(book.reviews);
  }
});

module.exports.general = public_users;
