module.exports = (req, res) => {
  const url = req.url || '';
  if (url.includes('/health')) {
    return res.status(200).json({
      status: 'ok',
      app: 'SriGanesh Friends Circle',
      version: '3.0.0',
      timestamp: new Date().toISOString()
    });
  }

  if (url.includes('/db-status')) {
    return res.status(200).json({
      status: 'ok',
      database: {
        connected: false,
        message: 'Cloud MySQL host, user, password environment variables required in Vercel settings.'
      }
    });
  }

  return res.status(200).json({
    status: 'ok',
    message: 'SriGanesh Friends Circle API Serverless Function Active'
  });
};
