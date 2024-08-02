const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const port = 3000;
const csvFilePath = path.join(__dirname, 'ringe_category_items.csv');

// Route to serve the CSV file as HTML
app.get('/csv', (req, res) => {
  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      let html = '<table border="1"><tr>';
      // Add table headers
      Object.keys(results[0]).forEach(header => {
        html += `<th>${header}</th>`;
      });
      html += '</tr>';
      // Add table rows
      results.forEach(row => {
        html += '<tr>';
        Object.values(row).forEach(value => {
          html += `<td>${value}</td>`;
        });
        html += '</tr>';
      });
      html += '</table>';
      res.send(html);
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/csv`);
});
