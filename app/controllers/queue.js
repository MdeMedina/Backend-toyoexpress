
const Pedido = require('../models/pedido');
const { procesarCola } = require('./worker');

async function encolarPedido(payload, utils) {
    const doc = {
        estado: 'pendiente',
        creadoEn: new Date(),
        payload
      }
  const pedido = await Pedido.create(doc);
  console.log('Pedido encolado:', pedido._id);
  return pedido._id;
}

module.exports = { encolarPedido };
