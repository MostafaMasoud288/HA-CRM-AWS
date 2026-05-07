/**
 * db.js — Aurora MySQL Connection Pools
 *
 * Writer endpoint  → DDL / INSERT / UPDATE / DELETE
 * Reader endpoint  → SELECT  (Aurora read replica / multi-AZ reader)
 *
 * Environment variables (injected via K8s Secret + ConfigMap):
 *   DB_WRITER_HOST, DB_READER_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */

const mysql = require('mysql2/promise');

const baseConfig = {
  port:             parseInt(process.env.DB_PORT || '3306', 10),
  user:             process.env.DB_USER,
  password:         process.env.DB_PASSWORD,
  database:         process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit:  10,
  queueLimit:       0,
  enableKeepAlive:  true,
  keepAliveInitialDelay: 10000,
  // Aurora-friendly settings
  connectTimeout:   10000,
  timezone:         'Z',
  charset:          'utf8mb4',
};

const writerPool = mysql.createPool({
  ...baseConfig,
  host: process.env.DB_WRITER_HOST,
});

const readerPool = mysql.createPool({
  ...baseConfig,
  host: process.env.DB_READER_HOST,
});

// Health check helpers
async function pingWriter() {
  const conn = await writerPool.getConnection();
  await conn.ping();
  conn.release();
}

async function pingReader() {
  const conn = await readerPool.getConnection();
  await conn.ping();
  conn.release();
}

module.exports = { writerPool, readerPool, pingWriter, pingReader };
