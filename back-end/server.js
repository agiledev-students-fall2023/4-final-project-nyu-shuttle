#!/usr/bin/env node
const server = require('./app'); 
const port = 4000;
const axios = require('axios');
const cheerio = require('cheerio');

const listener = server.listen(port, function () {
  console.log(`Server running on port: ${port}`);
});

const close = () => {
  listener.close();
};
module.exports = {
  close: close,
};
