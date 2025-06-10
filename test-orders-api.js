const express = require('express');
const app = express();

// Simple test to see if our orders hybrid API would work
app.get('/test-health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Simple test server working',
    timestamp: new Date().toISOString()
  });
});

// Test route order
app.get('/health', (req, res) => {
  res.json({ endpoint: 'health' });
});

app.get('/statistics', (req, res) => {
  res.json({ endpoint: 'statistics' });
});

app.get('/search/:search', (req, res) => {
  res.json({ endpoint: 'search', search: req.params.search });
});

app.get('/:id', (req, res) => {
  res.json({ endpoint: 'id', id: req.params.id });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});