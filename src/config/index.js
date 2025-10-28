require('dotenv').config();

const config = {
  mongo_uri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
  dbname: process.env.DB_NAME || process.env.DBNAME || 'ecommerce',
  jwt_secret: process.env.JWT_SECRET || 'supersecretjwtkey',
  jwt_expires_in: process.env.JWT_EXPIRES_IN || '1h',
  port: process.env.PORT || 3000,
};

module.exports = { config };
