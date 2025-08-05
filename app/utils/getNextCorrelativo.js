const Counter = require('../models/counters');
const dataPDF = require('../models/dataPDF'); // O la colección que guarda los pedidos

let initialized = false;

async function getNextCorrelativo() {
  if (!initialized) {
    const current = await Counter.findById('pedidoCorrelativo');

    if (!current) {
      // Buscar el correlativo más alto en la colección de pedidos
      const ultimoPedido = await dataPDF.findOne().sort({ cor: -1 });

      const startingValue = ultimoPedido?.cor || 1000; // default si no hay pedidos

      await Counter.findByIdAndUpdate(
        { _id: 'pedidoCorrelativo' },
        { $set: { seq: startingValue } },
        { upsert: true }
      );
    }

    initialized = true;
  }

  const result = await Counter.findByIdAndUpdate(
    { _id: 'pedidoCorrelativo' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  return result.seq;
}

module.exports = getNextCorrelativo;
