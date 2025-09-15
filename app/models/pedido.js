const mongoose = require('mongoose');

const pedidoSchema = new mongoose.Schema({
  estado: { type: String, enum: ['pendiente', 'procesando', 'completado', 'error'], default: 'pendiente' },
  payload: { type: Object },
  correlativo: { type: Number },
  creadoEn: { type: Date, default: Date.now },
  procesadoEn: { type: Date },
  error: { type: String }
});

const Pedido = mongoose.model('Pedido', pedidoSchema);
module.exports = Pedido;