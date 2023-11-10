// import and instantiate express
const express = require('express'); // CommonJS import style!
const app = express(); // instantiate an Express object
// we will put some server logic here later...

const cors = require('cors');
app.use(cors());

const url = 'https://nyu.passiogo.com/';

const buses = require('./buses.js');



app.get('/buses', async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    try {
        console.log('buses route entered')
        const busData = await buses.getBuses();
        console.log('bus data fetched')
        res.json(busData['buses']);
      } catch (error) {
        res.status(500).send('An error occurred while fetching the buses data');
      }
});

module.exports = app;
