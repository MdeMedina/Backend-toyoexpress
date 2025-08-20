const Reserva = require('../models/reserva');

async function reservarStock(codigoProducto, cantidad, idUsuario) {
    let reservadaHasta = new Date();
    reservadaHasta.setMinutes(reservadaHasta.getMinutes() + 2);
    await Reserva.create({
      codigoProducto,
      cantidad,
      reservadaHasta,
      idUsuario
    });
  }

async function cancelarReserva(codigoProducto, idUsuario) {
    await Reserva.deleteMany({
      codigoProducto,
      idUsuario
    });
  }

  async function verificarReserva(codigoProducto) {
    const reserva = await Reserva.find({
      codigoProducto,
      reservadaHasta: { $gt: new Date() } // aún válida
    });
    return reserva;
  } 

  module.exports = {
    reservarStock,
    cancelarReserva,
    verificarReserva
  };
