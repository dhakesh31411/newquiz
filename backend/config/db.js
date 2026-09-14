const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'quizmaster_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 15000
};

// Flexible SSL configuration for cloud MySQL hosts
if (
  process.env.DB_SSL === 'true' || 
  (process.env.DB_HOST && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1')
) {
  dbConfig.ssl = {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true'
  };
}

let poolInstance = null;

function getPool() {
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
  try {
    const connection = await pool.getConnection();
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
      message: `Database connection error: ${error.message}. Ensure MySQL credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT) are correctly configured.` 
    };
  }
};

module.exports = {
  pool,
  checkConnection
};
