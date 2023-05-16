const axios = require('axios');
const https = require('https');
const crypto = require('crypto');
const db = require('./connection');
const API_KEY = "YOUR-API-KEY";

// At request level
const agent = new https.Agent({
  rejectUnauthorized: false,
  secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
});

async function getCurrencies() {
  const urlBase = "https://evds2.tcmb.gov.tr/service/evds/series=TP.DK.USD.A-TP.DK.EUR.A-TP.DK.CHF.A-TP.DK.GBP.A";
  var today = new Date();
  const todayFormatted = today.toLocaleDateString("tr-TR").replaceAll(".","-"); //"05-04-2023";
  var url = `${urlBase}&startDate=${todayFormatted}&endDate=${todayFormatted}&type=json&key=${API_KEY}`;

  try {
    const { data } = await axios.get(url, { httpsAgent: agent });
    console.log(`Received currencies: ${JSON.stringify(data)}`);
    return data;
  } catch (error) {
    console.error(error);
  }
}

async function insertToDB({ USD, EUR }) {
  console.log(`Inserting currency values into DB [USD/YTL:${USD} EUR/YTL:${EUR}]`);
  const [rows, fields] = await db.query(
    `INSERT INTO tcmb (USD,EUR) VALUES ("${USD}","${EUR}")`
  );
  let status = 'ERROR';
  let message = 'Hata - Kaydedilemedi.';
  if (rows.affectedRows) {
    status = 'SUCCESS';
    message = 'Kaydedildi.';
  }
  return { message, status };
}

getCurrencies()
  .then(data => insertToDB({ USD: data.items[0].TP_DK_USD_A, EUR: data.items[0].TP_DK_EUR_A }))
  .then(({ message, status }) => {
    console.log(`${status} : ${message}`);
    process.exit();
  });
