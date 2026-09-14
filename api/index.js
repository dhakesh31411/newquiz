let app;
let initError = null;

try {
  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  require('dotenv').config();

  const apiRoutes = require(path.join(__dirname, '../backend/routes/api'));

  app = express();
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.use('/api', apiRoutes);
  app.use('/', apiRoutes);

  app.get('/api-info', (req, res) => {
    res.json({
      message: 'Welcome to SriGanesh Friends Circle Backend API',
      documentation: '/api/health',
      status: 'running'
    });
  });
} catch (err) {
  initError = err;
}

module.exports = (req, res) => {
  if (initError) {
    return res.status(500).json({
      success: false,
      error: initError.message,
      stack: initError.stack
    });
  }
  return app(req, res);
};
