const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('../backend/routes/api');

const app = express();

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

module.exports = app;
