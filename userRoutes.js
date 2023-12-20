const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbService = require('./dbService');
require('dotenv').config();
const secretKey = "8794587125463258921456375"

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const connection = await dbService.getConnection();
    
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const results = await executeQuery(connection, query, [username, password]);
    connection.release()

    if (results.length > 0) {
      const token = jwt.sign({ username: username }, secretKey, { expiresIn: '6h' });
      return res.status(200).json({ message: "User logged in successfully", username: username, success: true, token });
    } else {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});


router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const connection = await dbService.getConnection();
      const insertUserQuery = "INSERT INTO users (username, password) VALUES (?, ?)";
      await connection.query(insertUserQuery, [username, password,]);
      connection.release();
      res.status(201).json({ message: "User registered successfully", success: true });    
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({ error: "Failed to register user" });
  }
});

const executeQuery = (connection, query, values) => {
  return new Promise((resolve, reject) => {
    connection.query(query, values, (err, results) => {
      if (err) {
        console.error('MySQL query error: ' + err.stack);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = router;