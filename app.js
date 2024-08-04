const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { downloadCSV, processCSV } = require('./index'); // Import the functions from index.js


const app = express();
const port = 3000;

app.get('/', (req, res) => {
  const sampleJson = {
    message: "Welcome to Zumra Diamant API",
    endpoints: {
      csv: "/ring_display_csv",
      download: "/ring_download_csv"
    },
    author: "Admirise GmbH"
  };
  res.json(sampleJson)
})

app.get('/ring_download_csv', async (req, res) => {
  try {
    await downloadCSV();
    await processCSV('./items_dg_40.csv', './ringe_category_items.csv');
    res.download('./ringe_category_items.csv', 'ringe_category_items.csv', (err) => {
      if (err) {
        res.status(500).send(`Error sending file: ${err.message}`);
      }
    });
  } catch (error) {
    res.status(500).send(`Error processing CSV file: ${error.message}`);
  }
});

// Route to serve the CSV file as HTML
app.get('/ring_display_csv', async (req, res) => {
  const results = [];

  try {
    await downloadCSV();
    await processCSV('./items_dg_40.csv', './ringe_category_items.csv');
      
    fs.createReadStream('./ringe_category_items.csv')
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', () => {
        res.send(results);
      }).on('error', (err) => {
        res.status(500).send(`Error reading file: ${err.message}`);
      });
  } catch (error) {
    res.status(500).send(`Error processing CSV file: ${error.message}`);
  }
});

app.get('/csv_page', (req, res) => {
  const results = [];
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10000;
  const start = (page - 1) * limit;
  const end = page * limit;
  
  fs.createReadStream('./ringe_category_items.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const paginatedResults = results.slice(start, end);
      res.json({
        page,
        limit,
        total: results.length,
        totalPages: Math.ceil(results.length / limit),
        data: paginatedResults
      });
    })
    .on('error', (err) => {
      res.status(500).send(`Error reading file: ${err.message}`);
    });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
