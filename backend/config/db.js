const mysql = require('mysql2/promise');
require('dotenv').config();

const isProduction = Boolean(process.env.VERCEL || process.env.NODE_ENV === 'production');

const dbHost = process.env.DB_HOST ? process.env.DB_HOST.trim() : (isProduction ? '' : 'localhost');
const dbUser = process.env.DB_USER ? process.env.DB_USER.trim() : (isProduction ? '' : 'root');
const dbPassword = process.env.DB_PASSWORD ? process.env.DB_PASSWORD : '';
const dbName = process.env.DB_NAME ? process.env.DB_NAME.trim() : 'quizmaster_db';
const dbPort = parseInt(process.env.DB_PORT || '3306', 10);

const dbConfig = {
  host: dbHost || 'localhost',
  user: dbUser || 'root',
  password: dbPassword,
  database: dbName,
  port: isNaN(dbPort) ? 3306 : dbPort,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '5', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 5000
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
  if (isProduction && !process.env.DB_HOST) {
    throw new Error('Production Database Configuration Error: DB_HOST environment variable is missing in Vercel Environment Variables. Localhost fallback disabled in production.');
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
  if (isProduction && !process.env.DB_HOST) {
    const errMsg = 'DB_HOST environment variable is not configured in Vercel. Please set DB_HOST in Vercel Project Settings -> Environment Variables.';
    console.warn(`⚠️ MySQL Connection check aborted: ${errMsg}`);
    return {
      connected: false,
      host: 'MISSING_DB_HOST',
      database: dbName,
      message: errMsg
    };
  }

  try {
    const activePool = getPool();
    const connection = await activePool.getConnection();
    console.log(`✅ MySQL Database connected successfully! (Host: ${dbConfig.host}, DB: ${dbConfig.database})`);
    connection.release();
    return { 
      connected: true, 
      host: dbConfig.host, 
      database: dbConfig.database, 
      message: 'Database connected successfully' 
    };
  } catch (error) {
    console.warn(`⚠️ MySQL Connection failed (Host: ${dbConfig.host}, Port: ${dbConfig.port}):`, error.message);
    return { 
      connected: false, 
      host: dbConfig.host,
      database: dbConfig.database,
      message: `Database connection error: ${error.message}. Ensure MySQL credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT) are correctly configured in environment variables.` 
    };
  }
};

module.exports = {
  pool,
  checkConnection
};

