// import and instantiate express
const express = require('express'); // CommonJS import style!
const app = express(); // instantiate an Express object
// we will put some server logic here later...

const cors = require('cors');
app.use(cors());

module.exports = app;
