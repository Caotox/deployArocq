const express = require('express');
const app = express();

app.use(express.json());

// GET /health — healthcheck
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// GET /api/items — liste d'items
app.get('/api/items', (req, res) => {
  res.status(200).json({
    items: [
      { id: 1, name: 'Item Alpha' },
      { id: 2, name: 'Item Beta' },
      { id: 3, name: 'Item Gamma' },
    ],
  });
});

// POST /api/items — ajout d'un item
app.post('/api/items', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }
  res.status(201).json({ id: Date.now(), name }); // la date permet un Id unique
});

// GET /api/hello/:name
app.get('/api/hello/:name', (req, res) => {
  const { name } = req.params;
  res.status(200).json({ message: `Hello, ${name}!` }); // affichage de message classique avec paramètre dynamique dans l'URL
});

module.exports = app;
