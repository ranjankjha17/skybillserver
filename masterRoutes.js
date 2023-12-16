const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// const getConnection = require('./database');
const dbService = require('./dbService');


// Middleware to authenticate JWT
// const authenticateJWT = (req, res, next) => {
//   const token = req.header('Authorization');

//   if (!token) {
//     return res.sendStatus(401); // Unauthorized
//   }

//   jwt.verify(token, secretKey, (err, user) => {
//     if (err) {
//       return res.sendStatus(403); // Forbidden
//     }

//     req.user = user;
//     next();
//   });
// };


// router.post("/master",upload.single('photo'), async (req, res) => {
//   const { code, groupbc, rrnumber,name,cast,mobileno,id} = req.body;
//  console.log(req.file)
//  console.log(req.body)
//  const photo = req.file.buffer;
//  console.log('photo',photo)

//   try {
//     getConnection((err, connection) => {
//       if (err) {
//         console.error("Error getting database connection:", err);
//         return res.status(500).json({ error: "Failed to save data" });
//       }
//         const insertUserQuery = "INSERT INTO master (code, groupbc, rrnumber,name,cast,mobileno,id,photo) VALUES (?, ?,?,?,?,?,?,?)";
//         connection.query(insertUserQuery, [code, groupbc, rrnumber,name,cast,mobileno,id,photo], (error, result) => {
//           connection.release();
//           if (error) {
//             return res.status(500).json({ error: "Failed to register user" });
//           }
//           res.status(201).json({ message: "save master data successfully", success: true });
//         });
//       });
//   } catch (error) {
//     console.error("Error during save data:", error);
//     return res.status(500).json({ error: "Failed to save data" });
//   }
// });

// router.post("/master", async (req, res) => {
//   const { code, groupbc, rrnumber,name,cast,mobileno,id,photo} = req.body;
//   try {
//     getConnection((err, connection) => {
//       if (err) {
//         console.error("Error getting database connection:", err);
//         return res.status(500).json({ error: "Failed to save data" });
//       }
//         const insertUserQuery = "INSERT INTO master (code, groupbc, rrnumber,name,cast,mobileno,id,photo) VALUES (?, ?,?,?,?,?,?,?)";
//         connection.query(insertUserQuery, [code, groupbc, rrnumber,name,cast,mobileno,id,photo], (error, result) => {
//           connection.release();
//           if (error) {
//             return res.status(500).json({ error: "Failed to register user" });
//           }
//           res.status(201).json({ message: "save master data successfully", success: true });
//         });
//       });
//   } catch (error) {
//     console.error("Error during save data:", error);
//     return res.status(500).json({ error: "Failed to save data" });
//   }
// });

// router.post("/upload", upload.single('photo'), async (req, res) => {
//   const { code, groupbc, rrnumber, name, cast, mobileno, id, photo } = req.body;
//   const imageData = photo[0];
//   try {
//     const connection = await dbService.getConnection();

//     const insertUserQuery = "INSERT INTO master (code, groupbc, rrnumber, name, cast, mobileno, id, photo) VALUES (?, ?,?,?,?,?,?,?)";
//     const result = await dbService.query(insertUserQuery, [code, groupbc, rrnumber, name, cast, mobileno, id, imageData]);

//     connection.release();
//     res.status(201).json({ message: "save master data successfully", success: true });
//   } catch (error) {
//     console.error("Error during save data:", error);
//     return res.status(500).json({ error: "Failed to save data" });
//   }
// });


// router.post('/create-group', async (req, res) => {
//   const { groupName, members, amount } = req.body;

//   try {
//     const connection = await dbService.getConnection();
//     connection.release();

//     const sql = "INSERT INTO `group` (groupName, members, amount) VALUES (?, ?, ?)";
//     const result = await dbService.query(sql, [groupName, members, amount]);

//     if (result.affectedRows === 1) {
//       return res.status(201).json({ message: "created group successfully", success: true });
//     } else {
//       throw new Error('Failed to create group');
//     }
//   } catch (error) {
//     console.error('Error storing data in the database:', error);
//     res.status(500).json({ error: 'Error storing data in the database' });
//   }
// });


router.post('/create-bill', async (req, res) => {
  // console.log(req.body)
  try {
    const { date, time, serialnumber, agrnumber, farmername, bags, username } = req.body;
    //console.log('name',farmername);

    const connection = await dbService.getConnection();

    const insertQuery = "INSERT INTO TableA (date, time, serialnumber, agrnumber, farmername, totalbags, username) VALUES (?, ?, ?, ?, ?, ?, ?)";
    await dbService.query(insertQuery, [date, time, serialnumber, agrnumber, farmername, bags, username]);

    connection.release();
    res.status(201).json({ message: "Save bill data successfully", success: true });
  } catch (error) {
    console.error('Error storing data in the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});

// router.get('/get-billdetails', async (req, res) => {
//   try {
//     const connection = await dbService.getConnection();

//     const selectQuery = "SELECT MAX(CAST(agrnumber AS SIGNED)) AS maxCode FROM BillView";

//     try {
//       const results = await dbService.query(selectQuery);

//       let nextCode;

//       if (results.length > 0) {
//         const maxCode = results[0].maxCode;
//         nextCode = (maxCode !== null ? maxCode : 1).toString();
//       } else {
//         // If no records exist, start with '1' or any initial value you prefer
//         nextCode = '1';
//       }

//       const query=`select * from BillView where agrnumber=${nextCode}`

//       const results1 = await dbService.query(query);

//       res.json({ data: results1 });
//     } catch (error) {
//       console.error('Error:', error.message);
//       res.status(500).json({ error: 'Internal Server Error' });
//     } finally {
//       connection.release();
//     }
//   } catch (error) {
//     console.error('Error getting data from the database:', error);
//     res.status(500).send('Error storing data in the database');
//   }
// });


router.get('/get-billdetails/:agrnumber', async (req, res) => {

  const agrnumber = req.params.agrnumber;
 // console.log("agr",agrnumber)
  
  try {
    const connection = await dbService.getConnection();


    const query = `select * from BillView where agrnumber=?`

    const results = await dbService.query(query, [agrnumber]);
    connection.release();

    res.json({ data: results });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

router.post('/create-party', async (req, res) => {
  const party = req.body;
  console.log(party);

  if (!party || party.length === 0) {
    return res.status(400).json({ message: 'No party data provided' });
  }

  try {
    const connection = await dbService.getConnection();
    for (const p of party) {
      const { partyname, rate, quantity, agrnumber, serialnumber, username } = p;

      const query = `
        INSERT INTO TableB (partyname, rate, quantity,agrnumber,serialnumber,username)
        VALUES (?, ?, ?,?,?,?)
      `;

      const values = [partyname, rate, quantity, agrnumber, serialnumber, username];

      await dbService.query(query, values);
    }

    connection.release();

    return res.status(201).json({ message: 'Data inserted successfully', success: true });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred while adding data.' });
  }
});


// router.get('/getimage', async (req, res) => {
//   try {

//     const connection = await dbService.getConnection();

//     const insertQuery = "select name,photo from master";
//     const results=await dbService.query(insertQuery);

//     connection.release();
//     res.json({ data: results });

//     // res.status(201).json({ message: "Save form2 data successfully", success: true });
//   } catch (error) {
//     console.error('Error storing data in the database:', error);
//     res.status(500).send('Error storing data in the database');
//   }
// });

// router.get('/get-group', async (req, res) => {
//   try {

//     const connection = await dbService.getConnection();

//     const insertQuery = "select * from `group`";
//     const results=await dbService.query(insertQuery);

//     connection.release();
//     res.json({ data: results });

//     // res.status(201).json({ message: "Save form2 data successfully", success: true });
//   } catch (error) {
//     console.error('Error storing data in the database:', error);
//     res.status(500).send('Error storing data in the database');
//   }
// });

router.get('/get-serialnumber', async (req, res) => {
  try {

    const connection = await dbService.getConnection();

    const selectQuery = "SELECT MAX(CAST(serialnumber AS SIGNED)) AS maxCode FROM TableA";

    try {
      const results = await dbService.query(selectQuery);

      let nextCode;

      if (results.length > 0) {
        const maxCode = results[0].maxCode;
        nextCode = (maxCode !== null ? maxCode + 1 : 1).toString();
      } else {
        // If no records exist, start with '1' or any initial value you prefer
        nextCode = '1';
      }

      res.json({ data: nextCode });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      connection.release();
    }

    // res.status(201).json({ message: "Save form2 data successfully", success: true });
  } catch (error) {
    console.error('Error getting data from the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});



// router.post("/image", upload.single('photo'), async (req, res) => {
//   const {  photo } = req.body;
//  console.log("photo",photo)
//   const imageData = photo[0];
//   //console.log("imagedata",imageData)
//   try {
//     const connection = await dbService.getConnection();

//     const insertUserQuery = "INSERT INTO image (photo) VALUES (?)";
//     const result = await dbService.query(insertUserQuery, [photo]);

//     connection.release();
//     res.status(201).json({ message: "save image successfully", success: true });
//   } catch (error) {
//     console.error("Error during save data:", error);
//     return res.status(500).json({ error: "Failed to save data" });
//   }
// });


// router.post("/image", upload.single('photo'), async (req, res) => {
//   const {  photo } = req.body;
//  console.log("photo",photo)
//   // const imageData = photo[0];
//   // console.log("imagedata",imageData)
//   const imagePath = req.file.path;

//   // Read the image file
//   const imageBuffer = fs.readFileSync(imagePath);

//   try {
//     const connection = await dbService.getConnection();

//     const insertUserQuery = "INSERT INTO image (photo) VALUES (?)";
//     const result = await dbService.query(insertUserQuery, [imageBuffer]);

//     connection.release();
//     res.status(201).json({ message: "save image successfully", success: true });
//   } catch (error) {
//     console.error("Error during save data:", error);
//     return res.status(500).json({ error: "Failed to save data" });
//   }
// });

module.exports = router;