const mysql = require('mysql2/promise');
require('dotenv').config();

const isProduction = Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production');

const dbHost = process.env.DB_HOST ? process.env.DB_HOST.trim() : (isProduction ? '' : 'localhost');
const dbUser = process.env.DB_USER ? process.env.DB_USER.trim() : (isProduction ? '' : 'root');
const dbPassword = process.env.DB_PASSWORD ? process.env.DB_PASSWORD : '';
const dbName = process.env.DB_NAME ? process.env.DB_NAME.trim() : 'quizmaster_db';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

const dbConfig = {
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: isNaN(dbPort) ? 3306 : dbPort,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '5', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 8000
};

// Flexible SSL configuration for Railway MySQL / cloud hosts
if (
  process.env.DB_SSL === 'true' || 
  process.env.DB_SSL === '1' ||
  (!process.env.DB_SSL && dbHost && dbHost !== 'localhost' && dbHost !== '127.0.0.1')
) {
  dbConfig.ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
  };
} else if (process.env.DB_SSL === 'false' || process.env.DB_SSL === '0') {
  delete dbConfig.ssl;
}

let poolInstance = null;

function getPool() {
  if (!dbConfig.host) {
    throw new Error('Database Configuration Error: DB_HOST environment variable is missing.');
  }

  if (!poolInstance) {
    poolInstance = mysql.createPool(dbConfig);
  }
  return poolInstance;
}

const pool = new Proxy({}, {
  get(target, prop) {
    const activePool = getPool();
    const value = activePool[prop];
    return typeof value === 'function' ? value.bind(activePool) : value;
  }
});

const checkConnection = async () => {
  if (!process.env.DB_HOST) {
    const errMsg = 'DB_HOST environment variable is not configured. Please verify DB_HOST in Vercel Environment Variables.';
    return {
      connected: false,
      configured: false,
      host: 'Not Configured',
      database: dbName || 'Not Configured',
      message: errMsg
    };
  }

  try {
    const activePool = getPool();
    const connection = await activePool.getConnection();
    console.log(`✅ MySQL Database connected successfully! (Host: ${dbConfig.host})`);
    connection.release();
    return { 
      connected: true, 
      configured: true,
      host: dbConfig.host, 
      database: dbConfig.database || 'Configured', 
      message: 'Database connected successfully' 
    };
  } catch (error) {
    console.warn(`⚠️ MySQL Connection failed (Host: ${dbConfig.host}):`, error.message);
    return { 
      connected: false, 
      configured: true,
      host: dbConfig.host || 'Configured',
      database: dbConfig.database || 'Configured',
      message: `Database connection error: ${error.message}. Ensure MySQL credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT) are correctly configured in Vercel Environment Variables.` 
    };
  }
};

module.exports = {
  pool,
  checkConnection
};
