const mongoose = require('mongoose');
const { config } = require('./config');

async function connectDB() {
  try {
    // Priority: explicit MONGO_URI env -> constructed mongo_url from db config -> fallback local
    const uri =  config.mongo_url;
    if (!uri) {
      console.error('[mongo] No Mongo URI configured. Set MONGO_URI or DBUSER/DBPASSWORD/MONGO_CLUSTER.');
      process.exit(1);
    }

    await mongoose.connect(uri, {
      dbName: config.dbname,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[mongo] Conectado a la base: ${config.dbname}`);
  } catch (error) {
    console.error('[mongo] Error de conexión:', error.message,"url  "+config.mongo_url);
    process.exit(1);
  }
}

module.exports = { connectDB };
