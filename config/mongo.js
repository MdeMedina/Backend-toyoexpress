// config/mongo.js
const mongoose = require('mongoose');

const dbConnect = async () => {
  const DB_URI = process.env.DB_URI;
  if (!DB_URI) throw new Error('Falta DB_URI en .env');

  await mongoose.connect(DB_URI, {
    maxPoolSize: 30,
    minPoolSize: 5,
    maxIdleTimeMS: 60_000,
    serverSelectionTimeoutMS: 10000, // Aumentado para producción
    socketTimeoutMS: 45000, // Aumentado para consultas más largas en producción
    connectTimeoutMS: 10000, // Timeout para conexión inicial
    retryWrites: true,
    family: 4, // fuerza IPv4
    // Opciones adicionales para producción
    heartbeatFrequencyMS: 10000, // Verificar conexión cada 10s
    retryReads: true, // Reintentar lecturas fallidas
  });

  console.log('**** CONNECTED TO API ****');
  
  // Los índices se crean automáticamente en el modelo usando mongoose
  // No es necesario crearlos aquí ya que pueden no estar los modelos cargados aún
};

module.exports = { dbConnect };
