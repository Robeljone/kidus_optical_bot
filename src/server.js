// src/server.js
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve uploaded files placed in src/public/uploads
const uploadsPath = path.join(__dirname, 'public', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// basic health route
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Optical Bot static server' });
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Static file server running at http://localhost:${PORT}`);
  console.log(`Serving uploads from: ${uploadsPath}`);
});
    