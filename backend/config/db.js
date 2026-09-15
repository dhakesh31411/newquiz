const mysql = require('mysql2/promise');
require('dotenv').config();

function getDbConfig() {
  const host = process.env.DB_HOST ? process.env.DB_HOST.trim() : '';
  const user = process.env.DB_USER ? process.env.DB_USER.trim() : '';
  const password = process.env.DB_PASSWORD ? process.env.DB_PASSWORD : '';
  const database = process.env.DB_NAME ? process.env.DB_NAME.trim() : '';
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  const config = {
    host,
    user,
    password,
    database,
    port: isNaN(port) ? 3306 : port,
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '5', 10),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 8000
  };

  if (
    process.env.DB_SSL === 'true' || 
    process.env.DB_SSL === '1' ||
    (!process.env.DB_SSL && host && host !== 'localhost' && host !== '127.0.0.1')
  ) {
    config.ssl = {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
    };
  } else if (process.env.DB_SSL === 'false' || process.env.DB_SSL === '0') {
    delete config.ssl;
  }

  return config;
}

let poolInstance = null;
let currentPoolHost = null;

function getPool() {
  const host = process.env.DB_HOST ? process.env.DB_HOST.trim() : '';
  if (!host) {
    throw new Error('Database Configuration Error: DB_HOST environment variable is not configured.');
  }

  if (!poolInstance || currentPoolHost !== host) {
    if (poolInstance) {
      poolInstance.end().catch(() => {});
    }
    poolInstance = mysql.createPool(getDbConfig());
    currentPoolHost = host;
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

function getDiagnostics() {
  const host = process.env.DB_HOST ? process.env.DB_HOST.trim() : '';
  const user = process.env.DB_USER ? process.env.DB_USER.trim() : '';
  const database = process.env.DB_NAME ? process.env.DB_NAME.trim() : '';
  const port = parseInt(process.env.DB_PORT || '3306', 10);

  return {
    hostConfigured: !!host,
    host: host ? host.replace(/^(.*?@)?/, '') : 'not configured',
    port: isNaN(port) ? 3306 : port,
    database: database || 'not configured',
    user: user || 'not configured'
  };
}

const checkConnection = async () => {
  const diagnostics = getDiagnostics();

  if (!process.env.DB_HOST) {
    const errMsg = 'DB_HOST environment variable is not configured. Please set DB_HOST in Vercel Environment Variables.';
    return {
      connected: false,
      configured: false,
      status: 'error',
      database: 'disconnected',
      message: errMsg,
      diagnostics
    };
  }

  try {
    const activePool = getPool();
    const connection = await activePool.getConnection();
    console.log(`✅ MySQL Database connected successfully to ${diagnostics.host}!`);
    connection.release();
    return { 
      connected: true, 
      configured: true,
      status: 'ok',
      database: 'connected', 
      message: 'Database connected successfully',
      diagnostics
    };
  } catch (error) {
    console.warn(`⚠️ MySQL Connection failed:`, error.message);
    return { 
      connected: false, 
      configured: true,
      status: 'error',
      database: 'disconnected',
      message: `Database connection error: ${error.message}. Ensure MySQL credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT) are correctly configured in Vercel Environment Variables.`,
      diagnostics
    };
  }
};

module.exports = {
  pool,
  checkConnection,
  getDiagnostics
};

