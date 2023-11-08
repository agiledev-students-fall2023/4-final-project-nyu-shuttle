const axios = require('axios');
const cheerio = require('cheerio');

async function getBuses() {
    // Default options are marked with *
    const response = await fetch("https://passiogo.com/mapGetData.php?getBuses=1&deviceId=30185672&speed=1", {
    "headers": {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "sec-gpc": "1"
    },
    "referrer": "https://nyu.passiogo.com/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": "json=%7B%22s0%22%3A%221007%22%2C%22sA%22%3A1%7D",
    "method": "POST",
    "mode": "cors",
    "credentials": "omit"
  });;
    return response.json();
  }
  getBuses().then((r)=>{console.log(r)})

module.exports = {
  getBuses,
};


