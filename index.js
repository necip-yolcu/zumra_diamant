//yupaaetop8mafaa9 Ringgr��e

const fs = require('fs');
const ftp = require('basic-ftp');
const csv = require('csv-parser');
const { stringify } = require('csv-stringify');

const ftpConfig = {
  host: '195.4.159.226',
  user: 'zuemraadm',
  password: 'yupaaetop8mafaa9',
  secure: true, // Enable FTPS
  secureOptions: { rejectUnauthorized: false } // Allow self-signed certificates
};

const csvFilePath = './items_dg_40.csv';

const excludeColumns = ['URL Bild1', 'URL Bild2', 'URL Bild3', 'URL Bild4', 'URL Bild5', 'URL Bild6'];

async function downloadCSV() {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  
  try {
    await client.access(ftpConfig);
    await client.downloadTo(csvFilePath, 'items_dg_40.csv');
  } catch (err) {
    console.error(err);
  }
  
  client.close();
}

const processCSV = (inputFilePath, outputFilePath) => {
  const ringeItems = [];
  const variationGroups = {};

  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFilePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => {
        if (data['Kategorie_Ebene1'] === 'Ringe') {
          //excludeColumns.forEach(column => delete data[column]);
          data['Hauptmaterial_Modell_Legierung'] = `${data['Hauptmaterial']}_${data['Modell']}_${data['Legierung']}`;

          const variationParent = `${data['Hauptmaterial']}_${data['Modell']}_${data['Legierung']}`;
          const ringSize = parseInt(data['Ringgr��e'], 10);
          const price = parseFloat(data['UVP']);

          if (!variationGroups[variationParent]) {
            variationGroups[variationParent] = {
              items: [],
              maxPrice: price
            };
          }

          variationGroups[variationParent].items.push(data);
          if (price > variationGroups[variationParent].maxPrice) {
            variationGroups[variationParent].maxPrice = price;
          }

        }
      })
      .on('end', () => {
        let cnt = 0
        for (const parent in variationGroups) {
          const group = variationGroups[parent];
          //console.log("grooup: ", group.items.length)
          const existingSizes = group.items.map(item => parseInt(item['Ringgr��e'], 10));
          const maxPrice = group.maxPrice;

          for (let size = 48; size <= 60; size++) {
            if (!existingSizes.includes(size)) {
              const newItem = { ...group.items[0] };
              newItem['Ringgr��e'] = size.toString();
              newItem['UVP'] = maxPrice.toString();

              // Update 'Lang Artikelbezeichnung'
              const description = newItem['Lang Artikelbezeichnung'];
              const newDescription = description.replace(/Weite:\d+/, `Weite:${size}`);
              newItem['Lang Artikelbezeichnung'] = newDescription;
              
              // Update 'Englisch Lang Artikelbezeichnung'
              const engDescription = newItem['Englisch Lang Artikelbezeichnung'];
              const newEngDescription = engDescription.replace(/width:\d+/, `width:${size}`);
              newItem['Englisch Lang Artikelbezeichnung'] = newEngDescription;
              
              group.items.push(newItem);
            }
          }
          //group.items.push({});
          //console.log("number_group: ", group.items.length)

          ringeItems.push(...group.items);
          cnt++;
        }
        console.log(`Processed ${cnt} ring categories`)

        stringify(ringeItems, { header: true, delimiter: ';' }, (err, output) => {
          if (err) {
            reject(err);
          } else {
            fs.writeFile(outputFilePath, output, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(`Filtered "Ringe" category items have been written to ${outputFilePath}`);
              }
            });
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const processCSVWithBlanks = (inputFilePath, outputFilePath) => {
  const ringeItems = [];
  const variationGroups = {};

  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFilePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => {
        if (data['Kategorie_Ebene1'] === 'Ringe') {
          excludeColumns.forEach(column => delete data[column]);
          //data['Hauptmaterial_Modell'] = `${data['Hauptmaterial']}_${data['Modell']}_${data['Legierung']}`;
          data['Hauptmaterial_Modell'] = `${data['Hauptmaterial']}_${data['Modell']}`;

          //const variationParent = `${data['Hauptmaterial']}_${data['Modell']}_${data['Legierung']}`;
          const variationParent = `${data['Hauptmaterial']}_${data['Modell']}`;
          const ringSize = parseInt(data['Ringgr��e'], 10);
          const price = parseFloat(data['UVP']); //TODO {einkaufspreis[1]} another price

          // Update 'Lang Artikelbezeichnung'
          const description = newItem['Lang Artikelbezeichnung'];
          const newDescription = description.replace(/Weite:\d+/, `Weite:${size}`);
          newItem['Lang Artikelbezeichnung'] = newDescription;
          
          // Update 'Englisch Lang Artikelbezeichnung'
          const engDescription = newItem['Englisch Lang Artikelbezeichnung'];
          const newEngDescription = engDescription.replace(/width:\d+/, `width:${size}`);
          newItem['Englisch Lang Artikelbezeichnung'] = newEngDescription;

          if (!variationGroups[variationParent]) {
            variationGroups[variationParent] = {
              items: [],
              maxPrice: price
            };
          }

          variationGroups[variationParent].items.push(data);
          if (price > variationGroups[variationParent].maxPrice) {
            variationGroups[variationParent].maxPrice = price;
          }
        }
      })
      .on('end', () => {
        for (const parent in variationGroups) {
          const group = variationGroups[parent];
          const existingSizes = group.items.map(item => parseInt(item['Ringgr��e'], 10));
          const maxPrice = group.maxPrice;

          group.items.push({});

          ringeItems.push(...group.items);
        }

        stringify(ringeItems, { header: true, delimiter: ';' }, (err, output) => {
          if (err) {
            reject(err);
          } else {
            fs.writeFile(outputFilePath, output, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(`Filtered "Ringe" category items have been written to ${outputFilePath}`);
              }
            });
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const processCSV2 = (inputFilePath, outputFilePath) => {
  const ringeItems = [];
  const variationGroups = {};
  const modellGroups = {};

  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFilePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => {
        if (data['Kategorie_Ebene1'] === 'Ringe') {
          excludeColumns.forEach(column => delete data[column]);
          data['Hauptmaterial_Modell_Legierung'] = `${data['Hauptmaterial']}_${data['Modell']}_${data['Legierung']}`;

          const variationParent = `${data['Hauptmaterial']}_${data['Modell']}_${data['Legierung']}`;
          const ringSize = parseInt(data['Ringgr��e'], 10);
          const price = parseFloat(data['UVP']);

          // Update 'Lang Artikelbezeichnung'
          const description = newItem['Lang Artikelbezeichnung'];
          const newDescription = description.replace(/Weite:\d+/, `Weite:${size}`);
          newItem['Lang Artikelbezeichnung'] = newDescription;
          
          // Update 'Englisch Lang Artikelbezeichnung'
          const engDescription = newItem['Englisch Lang Artikelbezeichnung'];
          const newEngDescription = engDescription.replace(/width:\d+/, `width:${size}`);
          newItem['Englisch Lang Artikelbezeichnung'] = newEngDescription;

          if (!variationGroups[variationParent]) {
            variationGroups[variationParent] = {
              items: [],
              maxPrice: price
            };
          }

          variationGroups[variationParent].items.push(data);
          if (price > variationGroups[variationParent].maxPrice) {
            variationGroups[variationParent].maxPrice = price;
          }

          if (!modellGroups[data['Modell']]) {
            modellGroups[data['Modell']] = {
              items: [],
              maxPrice: price
            };
          }

          modellGroups[data['Modell']].items.push(data);
          if (price > modellGroups[data['Modell']].maxPrice) {
            modellGroups[data['Modell']].maxPrice = price;
          }
        }
      })
      .on('end', () => {
        let cnt = 0;
        let cnt2 = 0;
        for (const parent in variationGroups) {
          const group = variationGroups[parent];
          const existingSizes = group.items.map(item => parseInt(item['Ringgr��e'], 10));
          const maxPrice = group.maxPrice;

          for (let size = 48; size <= 60; size++) {
            if (!existingSizes.includes(size)) {
              const newItem = { ...group.items[0] };
              newItem['Ringgr��e'] = size.toString();
              newItem['UVP'] = maxPrice.toString();
              group.items.push(newItem);
            }
          }
          //group.items.push({}); // Add empty line after each variation group
          ringeItems.push(...group.items);
          cnt++;
        }

        for (const parent in modellGroups) {
          const group = modellGroups[parent];
          group.items.push({}); // Add empty line after each Modell group
          ringeItems.push(...group.items);
          cnt2++;
        }

        console.log(`Processed ${cnt} ring categories`);
        console.log(`Processed ${cnt2} ring2 categories`);

        stringify(ringeItems, { header: true, delimiter: ';' }, (err, output) => {
          if (err) {
            reject(err);
          } else {
            fs.writeFile(outputFilePath, output, (err) => {
              if (err) {
                reject(err);
              } else {
                resolve(`Filtered "Ringe" category items have been written to ${outputFilePath}`);
              }
            });
          }
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};
  

// Execute the function to download the CSV file and process it
downloadCSV()
  .then(() => processCSV(csvFilePath, './ringe_category_items.csv'))
  //.then(() => processCSV2(csvFilePath, './ringe_category_items222.csv'))
  //.then(() => processCSVWithBlanks(csvFilePath, './ringe_category_items_blanks_2attr.csv'))
  .then((message) => {
    console.log(message);
  })
  .catch((error) => {
    console.error('Error processing CSV file:', error);
  });
