// import and instantiate express
const express = require('express'); // CommonJS import style!
const app = express(); // instantiate an Express object
// we will put some server logic here later...

const url = 'https://nyu.passiogo.com/';

const buses = require('./buses.js');

app.get('/buses', async (req, res) => {
    const busData = await buses.getBuses();
});

module.exports = app;
