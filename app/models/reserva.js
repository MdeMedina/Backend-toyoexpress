// models/reserva.js
const mongoose = require('mongoose');

const ReservaSchema = new mongoose.Schema({
  codigoProducto: { type: String, required: true },
  cantidad: { type: Number, required: true },
  reservadaHasta: { type: Date, required: true },
  idUsuario: { type: String, required: true }, // o sessionId si es anónimo
});

module.exports = mongoose.model('Reserva', ReservaSchema);