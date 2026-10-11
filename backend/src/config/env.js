const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/agri_platform',
  JWT_SECRET: process.env.JWT_SECRET || 'agri_super_secret_jwt_key_2026_production_grade_token_auth',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  ADMIN: {
    NAME: process.env.ADMIN_NAME || 'Platform Administrator',
    EMAIL: (process.env.ADMIN_EMAIL || '').toLowerCase().trim(),
    PASSWORD: process.env.ADMIN_PASSWORD || '',
    PHONE: process.env.ADMIN_PHONE || ''
  },
  EMAIL: {
    HOST: process.env.EMAIL_HOST || process.env.MAIL_HOST || 'smtp.gmail.com',
    PORT: parseInt(process.env.EMAIL_PORT || process.env.MAIL_PORT, 10) || 587,
    USER: process.env.EMAIL_USER || process.env.MAIL_USER || '',
    PASS: process.env.EMAIL_PASS || process.env.MAIL_APP_PASSWORD || process.env.MAIL_PASS || '',
    FROM: process.env.EMAIL_FROM || process.env.MAIL_FROM || '"AgriShare Platform" <noreply@agrishare.ai>'
  }
};

