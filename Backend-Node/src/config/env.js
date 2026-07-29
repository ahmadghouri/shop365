const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function required(key) {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional(key, defaultValue) {
  return process.env[key] || defaultValue;
}

module.exports = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '5000'), 10),
  MONGODB_URI: required('MONGODB_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '9999d'),
  CORS_ORIGINS: optional('CORS_ORIGINS', '*'),
  LOG_LEVEL: optional('LOG_LEVEL', 'info'),
  UPLOAD_PATH: optional('UPLOAD_PATH', './uploads'),
  MAX_FILE_SIZE: parseInt(optional('MAX_FILE_SIZE', '2097152'), 10),
  MAIL_MAILER: optional('MAIL_MAILER', 'log'),
  MAIL_FROM_ADDRESS: optional('MAIL_FROM_ADDRESS', 'noreply@shop365.com'),
  MAIL_FROM_NAME: optional('MAIL_FROM_NAME', 'Shop365'),
  POS_PRODUCTS_URL: optional('POS_PRODUCTS_URL', ''),
  CLOUDINARY_CLOUD_NAME: optional('CLOUDINARY_CLOUD_NAME', ''),
  CLOUDINARY_API_KEY: optional('CLOUDINARY_API_KEY', ''),
  CLOUDINARY_API_SECRET: optional('CLOUDINARY_API_SECRET', ''),
  CLOUDINARY_ROOT_FOLDER: optional('CLOUDINARY_ROOT_FOLDER', 'shop365'),
};
