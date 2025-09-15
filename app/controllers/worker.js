const { sendOrder } = require('./orders');
const generarPDF = require('../utils/pdfGenerator');
const emailer = require('../../config/emailer');
const { updateStock } = require('./excel');
const { crearPDF } = require('./dataPDF');
const Pedido = require('../models/pedido');
const getNextCorrelativo = require('../utils/getNextCorrelativo');
const Reserva = require('../models/reserva');
const { cancelarReserva } = require('./reserva');

async function procesarCola() {
  const pedido = await Pedido.findOneAndUpdate(
    { estado: "pendiente" },
    { estado: "procesando" },
    { sort: { creadoEn: 1 }, new: true }
  );

  if (!pedido) {
    return;
  }

  try {
    const correlativo = await getNextCorrelativo();

    console.log('Procesando pedido:', pedido._id);
    console.log('Correlativo:', correlativo);

    await crearPDF(pedido.payload.cliente, pedido.payload.vendedor, pedido.payload.productos, correlativo, pedido.payload.total);
    await sendOrder(pedido.payload.cliente, pedido.payload.productos, correlativo, pedido.payload.emails);

    const pdfBuffer = await generarPDF(
      pedido.payload.cliente,
      pedido.payload.productos,
      pedido.payload.total,
      pedido.payload.items,
      pedido.payload.notaPedido,
      correlativo,
      pedido.payload.hora,
      pedido.payload.vendedor
    );

    await emailer.sendMail(pdfBuffer, "pedidostoyoxpress@gmail.com", pedido.payload.notaCorreo, correlativo, pedido.payload.cliente.Nombre);
    await emailer.sendMail(pdfBuffer, "toyoxpressca@gmail.com", pedido.payload.notaCorreo, correlativo, pedido.payload.cliente.Nombre);
    await emailer.sendMail(pdfBuffer, "mamedina770@gmail.com", pedido.payload.notaCorreo, correlativo, pedido.payload.cliente.Nombre);

    await Promise.all(
        pedido.payload.productos.map(async producto => {
          await updateStock(producto["Código"], producto["cantidad"]);
          cancelarReserva(producto["Código"], pedido.payload.vendedor);
        })
      );

    pedido.estado = 'completado';
    pedido.correlativo = correlativo;
    pedido.procesadoEn = new Date();
    await pedido.save();

    console.log('✅ Pedido completado');
  } catch (err) {
    pedido.estado = 'error';
    pedido.error = err.message;
    await pedido.save();
    console.error('❌ Error procesando pedido:', err);
  }
}

setInterval(procesarCola, 60000);
