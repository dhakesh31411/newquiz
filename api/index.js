const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'SriGanesh Friends Circle',
    version: '3.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/db-status', (req, res) => {
  res.json({
    status: 'ok',
    database: {
      connected: false,
      message: 'Cloud MySQL host, user, password environment variables required in Vercel settings.'
    }
  });
});

try {
  const apiRoutes = require('../backend/routes/api');
  app.use('/api', apiRoutes);
  app.use('/', apiRoutes);
} catch (err) {
  console.error('Error attaching full apiRoutes:', err);
}

module.exports = app;
