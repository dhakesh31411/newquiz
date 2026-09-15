const app = require('../backend/server');

module.exports = (req, res) => {
  const forwardedUri = req.headers['x-forwarded-uri'] || req.headers['x-override-url'];
  if (forwardedUri && typeof forwardedUri === 'string' && forwardedUri.startsWith('/api')) {
    req.url = forwardedUri;
  }
  return app(req, res);
};

