const mongoose = require('mongoose');

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI is not configured. Starting API without database connection.');
    return null;
  }

  mongoose.set('strictQuery', true);

  const connection = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });

  console.log(`MongoDB connected: ${connection.connection.host}`);
  return connection;
}

module.exports = connectDatabase;
