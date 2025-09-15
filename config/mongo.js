// config/mongo.js
const mongoose = require('mongoose');

const dbConnect = async () => {
  const DB_URI = process.env.DB_URI;
  if (!DB_URI) throw new Error('Falta DB_URI en .env');

  await mongoose.connect(DB_URI, {
    maxPoolSize: 30,
    minPoolSize: 5,
    maxIdleTimeMS: 60_000,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 20000,
    retryWrites: true,
    family: 4, // fuerza IPv4
  });

  console.log('**** CONNECTED TO API ****');
};

module.exports = { dbConnect };
