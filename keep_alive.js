// keep_alive.js
require('dotenv').config();
const express = require('express');
const app = express();

// Web server for uptime monitoring
app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

// Use PORT from .env or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Keep-alive server running on port ${PORT}`);
});

// Replace with your public Replit/Render URL
const url = process.env.APP_URL || 'https://YOUR_APP_URL_HERE';

// Ping every 1 minute
setInterval(() => {
  fetch(url).catch(() => console.log('Keep-alive ping failed.'));
}, 60 * 1000);
