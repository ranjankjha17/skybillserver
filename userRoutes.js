const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dbService = require('./dbService');
require('dotenv').config();
const secretKey = "8794587125463258921456375"

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }

    req.user = user;
    next();
  });
};


// router.post("/login", async (req, res) => {
//   const { username, password } = req.body;
//   console.log(username)
//   const connection = await dbService.getConnection();
//   try {
//     const getUserQuery = "SELECT * FROM user WHERE username = ?";
//     const results = await connection.query(getUserQuery, [username]);
// //console.log(results)
//     if (results.length > 0) {
//       const user = results[0];
//       const isMatch = await bcrypt.compare(password, user.password);

//       if (isMatch) {
//         const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '6h' });
//         console.log(`User ${username} logged in successfully`);
//         return res.status(200).json({ message: "User logged in successfully", success: true, token });
//       } else {
//         return res.status(401).json({ error: "Incorrect password" });
//       }
//     } else {
//       return res.status(401).json({ error: "User not found" });
//     }
//   } catch (error) {
//     console.error("Error during login:", error);
//     return res.status(500).json({ error: "Failed to login" });
//   }
// });


// router.post("/register", async (req, res) => {
//   const { username, password } = req.body;
//   try {
//     const connection = await dbService.getConnection();
//     try {
//       const hashedPassword = await bcrypt.hash(password, 10);
//       const insertUserQuery = "INSERT INTO user (username, password) VALUES (?, ?)";
//       await connection.query(insertUserQuery, [username, hashedPassword,]);

//       res.status(201).json({ message: "User registered successfully", success: true });
//     } finally {
//       connection.release();
//     }
//   } catch (error) {
//     console.error("Error during user registration:", error);
//     return res.status(500).json({ error: "Failed to register user" });
//   }
// });



router.get('/check-email', (req, res) => {
  const email = req.query.email;
  getConnection((err, connection) => {
    if (err) {
      console.error("Error getting database connection:", err);
      return res.status(500).json({ error: "Failed to register user" });
    }

    connection.query('SELECT COUNT(*) as count FROM drop_users WHERE email = ?', [email], (error, results) => {
      connection.release();

      if (error) {
        console.error("Error executing database query:", error);
        return res.status(500).json({ error: "Database error" });
      }

      try {
        const isEmailTaken = results[0].count > 0;
        res.json({ isEmailTaken });
      } catch (err) {
        console.error("Error processing database results:", err);
        res.status(500).json({ error: "Result processing error" });
      }
    });
  });
});


// API to get users with name and email
router.get("/users", authenticateJWT, (req, res) => {
  try {
    getConnection((err, connection) => {
      if (err) {
        console.error("Error getting database connection:", err);
        return res.status(500).json({ error: "Failed to fetch users" });
      }

      const getUsersQuery = "SELECT username, email FROM drop_users";

      connection.query(getUsersQuery, (error, results) => {
        connection.release();

        if (error) {
          return res.status(500).json({ error: "Failed to fetch users" });
        }

        res.json({ users: results });
      });
    });
  } catch (error) {
    console.error("Error during fetch users:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// router.post('/login', async (req, res) => {
//   const { username, password } = req.body;

//   if (!username || !password) {
//     return res.status(400).json({ message: 'Username and password are required' });
//   }
//   const connection = await dbService.getConnection();

//   const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
//   await connection.query(query, [username, password], (err, results) => {
//     if (err) {
//       console.error('MySQL query error: ' + err.stack);
//       return res.status(500).json({ message: 'Internal server error' });
//     }

//     if (results.length > 0) {
//       const token = jwt.sign({ username:username }, secretKey, { expiresIn: '6h' });
//       //console.log(`User ${username} logged in successfully`);
//       return res.status(200).json({ message: "User logged in successfully", username:username,success: true, token });

//      // return res.json({ message: 'Login successful' });
//     } else {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//   });
// });

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