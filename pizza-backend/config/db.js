const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let sslConfig;

if (process.env.DB_SSL_CERT) {
  const certValue = process.env.DB_SSL_CERT;
  
  // Check if it's a certificate (contains BEGIN CERTIFICATE) or a file path
  if (certValue.includes('-----BEGIN CERTIFICATE-----')) {
    // It's the actual certificate content
    sslConfig = { ca: certValue };
    console.log('Using SSL certificate from environment variable');
  } else {
    // It's a file path - read the file
    try {
      const certPath = path.join(__dirname, certValue);
      sslConfig = { ca: fs.readFileSync(certPath) };
      console.log('Using SSL certificate from file:', certPath);
    } catch (error) {
      console.error('SSL certificate file not found:', certValue);
      throw error;
    }
  }
} else if (process.env.DB_SSL_CA) {
  try {
    const certPath = path.join(__dirname, process.env.DB_SSL_CA);
    sslConfig = { ca: fs.readFileSync(certPath) };
    console.log('Using SSL certificate from file (DB_SSL_CA):', certPath);
  } catch (error) {
    console.error('SSL certificate file not found:', process.env.DB_SSL_CA);
    throw error;
  }
}

// If no SSL config, proceed without SSL
if (!sslConfig) {
  console.log('No SSL configuration found - connecting without SSL');
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pizza_app',
  port: process.env.DB_PORT || 3306,
  ssl: sslConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const connectDB = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('MySQL connected successfully');
    connection.release();
  } catch (err) {
    console.error('MySQL connection error:', err.message);
    if (err.stack) {
      console.error('Stack:', err.stack);
    }
    process.exit(1);
  }
};

module.exports = { pool, connectDB };