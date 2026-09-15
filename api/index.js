const app = require('../backend/server');

module.exports = (req, res) => {
  const targetUrl = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.url;
  if (targetUrl && typeof targetUrl === 'string' && targetUrl.startsWith('/api')) {
    req.url = targetUrl;
  }
  return app(req, res);
};
