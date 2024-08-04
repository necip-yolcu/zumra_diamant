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
          data['Hauptmaterial_Modell'] = `${data['Hauptmaterial']}_${data['Modell']}_${data['Legierung']}_${data['Legierungsgewicht']}_${data['Anzahl Steine']}_${data['Farbstein Caratur']}_${data['Caratur']}_${data['Breite']}`;

          const variationParent = `${data['Hauptmaterial']}_${data['Modell']}_${data['Legierung']}_${data['Legierungsgewicht']}_${data['Anzahl Steine']}_${data['Farbstein Caratur']}_${data['Caratur']}_${data['Breite']}`;
          const price = parseFloat(data['UVP']); //TODO {einkaufspreis[1]} another price

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
        let say = 0;
        let seenCmb = 0;

        const seenCombinations = new Set();
        const seenCombinations2 = new Set();
        for (const parent in variationGroups) {
          const group = variationGroups[parent];

          const uniqueItems = group.items.filter(item => {
            if (item.UVP !== undefined) {
              const combinationPrice = `${item.UVP}_${item['Kurz Artikelbezeichnung']}_${item['Ringgr��e']}_${item['Hauptmaterial']}_${item['Modell']}_${item['Legierung']}_${item['Legierungsgewicht']}_${item['Anzahl Steine']}_${item['Farbstein Caratur']}_${item['Caratur']}`
              
              if (!seenCombinations.has(combinationPrice)) {
                seenCombinations.add(combinationPrice);
                return true;
              }
              else {
                seenCmb++;
              }

            }
            return false;
          });

          const uniqueItems2 = uniqueItems.filter(uniqueItem => {
            const combinationPriceRing = `${uniqueItem.UVP}_${uniqueItem['Kurz Artikelbezeichnung']}_${uniqueItem['Hauptmaterial']}_${uniqueItem['Modell']}_${uniqueItem['Legierung']}_${uniqueItem['Legierungsgewicht']}_${uniqueItem['Anzahl Steine']}_${uniqueItem['Farbstein Caratur']}_${uniqueItem['Caratur']}`
            if (!seenCombinations2.has(combinationPriceRing)) {
              seenCombinations2.add(combinationPriceRing);
              return true;
            }
            return false
          })

          const uniqueItems3 = [];
          const maxPrices = {};
          // Find max price for each unique combination
          uniqueItems2.forEach(item => {
            const combination = `${item['Kurz Artikelbezeichnung']}_${item['Ringgr��e']}_${item['Hauptmaterial']}_${item['Modell']}_${item['Legierung']}_${item['Legierungsgewicht']}_${item['Anzahl Steine']}_${item['Farbstein Caratur']}_${item['Caratur']}`;
            const price = parseFloat(item['UVP']);

            if (!maxPrices[combination] || price > maxPrices[combination].price) {
              maxPrices[combination] = { item, price };
            }
          });

          for (const combination in maxPrices) {
            uniqueItems3.push(maxPrices[combination].item);
          }

          // ürünleri gruplu görmek için.. DEV
          /* if (uniqueItems3.length <= 1) {
            continue;
          } */

          uniqueItems3.forEach(item => {
            if (item.UVP !== undefined) {
              ringeItems.push({ ...item });
              //DEV ringeItems.push({ price: item.UVP, ringSize: item['Ringgr��e'], krt: item['Legierungsgewicht'], Caratur: item['Caratur'], Farbstein_Caratur: item['Farbstein Caratur'], Anzahl_Steine_Diamant: item['Anzahl_Steine_Diamant'], Caratur_Diamant: item['Caratur_Diamant'], breite: item['Breite'], ...item });
            }
          });
          
          //ringeItems.push({}); //DEV
          say++;
        }
        console.log("say: ", say);
        console.log("seenCmb: ", seenCmb)

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
/* downloadCSV() //DEV
  //.then(() => processCSV(csvFilePath, './ringe_category_items_dev.csv'))
  .then(() => processCSV(csvFilePath, './ringe_category_items.csv'))
  .then((message) => {
    console.log(message);
  })
  .catch((error) => {
    console.error('Error processing CSV file:', error);
  }); */

module.exports = {
  downloadCSV,
  processCSV
};
