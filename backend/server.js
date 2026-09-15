const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');
const { checkConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Normalize Vercel serverless rewritten paths cleanly
app.use((req, res, next) => {
  if (req.query && req.query.path) {
    const subpath = req.query.path.startsWith('/') ? req.query.path : '/' + req.query.path;
    req.url = '/api' + subpath;
  } else if (req.url.startsWith('/api/index.js')) {
    const raw = req.url.replace('/api/index.js', '');
    req.url = raw.startsWith('/api') ? raw : '/api' + (raw.startsWith('/') ? raw : '/' + raw);
  }
  next();
});

// Dual mount apiRoutes to handle both /api/* and rewritten serverless paths cleanly on Vercel
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Root Route Fallback
app.get('/api-info', (req, res) => {
  res.json({
    message: 'Welcome to SriGanesh Friends Circle Backend API',
    documentation: '/api/health',
    status: 'running'
  });
});

// Start Local Dev Server only when executed directly via node CLI
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`\n🚀 SriGanesh Friends Circle Backend server running on http://localhost:${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📊 DB Status: http://localhost:${PORT}/api/db-status\n`);
    
    // Test DB Connection on startup
    await checkConnection();
  });
}

module.exports = app;

