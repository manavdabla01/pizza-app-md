const fs = require('fs');
const path = require('path');

// If DB_SSL_CERT contains certificate content, write it to a file
if (process.env.DB_SSL_CERT && process.env.DB_SSL_CERT.includes('-----BEGIN CERTIFICATE-----')) {
  const certPath = path.join(__dirname, 'ca.pem');
  fs.writeFileSync(certPath, process.env.DB_SSL_CERT);
  console.log('SSL certificate written to:', certPath);
  // Override the env var to point to the file
  process.env.DB_SSL_CERT = 'ca.pem';
}