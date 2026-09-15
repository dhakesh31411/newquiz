const jwt = require('jsonwebtoken');

const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
  }

  const isProduction = Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production');
  const secret = process.env.JWT_SECRET || (!isProduction ? 'quizmaster_super_secret_jwt_key_2026' : '');

  if (!secret) {
    return res.status(500).json({ success: false, message: 'Server configuration error: JWT_SECRET environment variable is missing in production.' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};

module.exports = {
  verifyAdminToken
};

