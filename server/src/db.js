const mongoose = require('mongoose');
const dns = require('dns');

// Use reliable DNS servers for MongoDB Atlas SRV resolution on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if restricted
}

let isMongoConnected = false;

// Connection event monitoring
mongoose.connection.on('connected', () => {
  isMongoConnected = true;
  console.log('====================================================');
  console.log('[MongoDB Atlas] ✅ Successfully connected to Cloud Database!');
  console.log('====================================================');
});

mongoose.connection.on('error', (err) => {
  isMongoConnected = false;
  console.error('[MongoDB Atlas] ❌ Cloud DB connection error:', err.message);
  if (err.message.includes('whitelist') || err.message.includes('Could not connect to any servers')) {
    console.error('👉 ACTION NEEDED: Add 0.0.0.0/0 to your MongoDB Atlas IP Access List (Network Access tab in Atlas).');
  }
});

mongoose.connection.on('disconnected', () => {
  isMongoConnected = false;
  console.warn('[MongoDB Atlas] ⚠️ Disconnected from MongoDB Atlas. Retrying connection...');
});

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('[MongoDB Atlas] ❌ MONGODB_URI is not defined in server/.env!');
    return;
  }

  const maskedUri = mongoUri.replace(/:([^:@]{4,})@/, ':****@');
  console.log(`[MongoDB Atlas] Connecting to Cloud Database: ${maskedUri}...`);

  const attemptConnect = async () => {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 8000,
      });
      isMongoConnected = true;
    } catch (err) {
      isMongoConnected = false;
      console.error(`[MongoDB Atlas] ❌ Connection failed: ${err.message}`);
      if (err.message.includes('whitelist') || err.message.includes('Could not connect to any servers')) {
        console.error('----------------------------------------------------');
        console.error('🚨 MONGODB ATLAS IP WHITELIST REQUIRED:');
        console.error('1. Go to https://cloud.mongodb.com/');
        console.error('2. Click "Network Access" in the left menu.');
        console.error('3. Click "Add IP Address" -> Select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0).');
        console.error('4. Click "Confirm". Connection will succeed automatically!');
        console.error('----------------------------------------------------');
      }
      // Retry in 8 seconds
      setTimeout(attemptConnect, 8000);
    }
  };

  await attemptConnect();
}

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
};
