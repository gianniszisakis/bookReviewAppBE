const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  const validUsername = users.filter((user) => {
    return user.username === username;
  });

  if (validUsername.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.

  const correctCredentials = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  if (correctCredentials.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(403).json({ message: "Username or password missing" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 },
    );

    req.session.authorization = { accessToken, username };
    return res.status(200).send("User logged in");
  } else {
    return res.status(208).send("Wrong username or password");
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const review = req.query.review;
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "No review" });
  }

  if (!books[isbn]) {
    return res.status(400).json({ message: "No book found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "review added" });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "No book found" });
  }

  if (!books[isbn].reviews[username]) {
    return res
      .status(400)
      .json({ message: `No book review found from the user ${username}` });
  }
  delete books[isbn].reviews[username];
  res.status(200).json({ message: "Book review deleted" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
