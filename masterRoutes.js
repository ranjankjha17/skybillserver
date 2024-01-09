const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const dbService = require('./dbService');
const puppeteer = require('puppeteer');

router.post('/create-bill', async (req, res) => {
  try {
    const { date, time, serialnumber, agrnumber, farmername, bags, username } = req.body;
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

// router.get('/get-billdetails/:agrnumber', async (req, res) => {
//   const agrnumber = req.params.agrnumber;
//  // console.log("agr",agrnumber)
//   try {
//     const connection = await dbService.getConnection();
//     const query = `select * from BillView where agrnumber=?`
//     const results = await dbService.query(query, [agrnumber]);
//     connection.release();
//     res.json({ data: results });
//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ error: 'Internal Server Error' });
//   } 
// });

router.get('/get-billdetails/:serialnumber', async (req, res) => {
  const serialnumber = req.params.serialnumber;
 // console.log("agr",agrnumber)
  try {
    const connection = await dbService.getConnection();
    const query = `select * from BillsView where serialnumber=?`
    const results = await dbService.query(query, [serialnumber]);
    connection.release();
    res.json({ data: results });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
});

router.post('/create-party', async (req, res) => {
const party = req.body;
 // console.log(party);

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
  } catch (error) {
    console.error('Error getting data from the database:', error);
    res.status(500).send('Error storing data in the database');
  }
});

router.post('/convertToBitmap', async (req, res) => {
  const { htmlContent } = req.body;

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const screenshot = await page.screenshot({ encoding: 'base64' });
    await browser.close();

    res.json({ success: true, data: screenshot });
  } catch (error) {
    console.error('Error converting to bitmap:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});



module.exports = router;