const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SriGanesh Friends Circle',
    version: '3.0.0',
    timestamp: new Date().toISOString()
  });
});

try {
  const apiRoutes = require('../../backend/routes/api');
  app.use('/api', apiRoutes);
  app.use('/', apiRoutes);
} catch (err) {
  console.error('Error loading backend apiRoutes in frontend api:', err);
}

module.exports = app;
