// keep_alive.js
const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

app.listen(3000, () => {
  console.log('Keep-alive server is running!');
});

// Ping itself every 1 minute
setInterval(() => {
  fetch('http://localhost:3000').catch(() => console.log('Keep-alive ping failed.'));
}, 60 * 1000);
