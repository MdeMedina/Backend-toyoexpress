// app/controllers/worker.js
const { sendOrder } = require('./orders');
const generarPDF = require('../utils/pdfGenerator');
const emailer = require('../../config/emailer');
const { updateStock } = require('./excel');
const { crearPDF } = require('./dataPDF');
const Pedido = require('../models/pedido');
const getNextCorrelativo = require('../utils/getNextCorrelativo');
const { cancelarReserva } = require('./reserva');

/**
 * Procesa un pedido. Puede venir el payload completo o un pedidoId.
 * - Si llega pedidoId: carga/actualiza el documento en Mongo
 * - Si llega payload directo: procesa "stateless" (sin depender de Mongo)
 */
async function procesarPedido({ pedidoId, payload }) {
  let pedidoDoc = null;
  let workingPayload = payload;

  // Modo 1: buscar/lockear pedido en BD si mandan el id
  if (pedidoId) {
    let pedidoDocRev = await Pedido.findOne({_id: pedidoId});
    console.log(`Procesando pedidoId=${pedidoId}, estado actual:`, pedidoDocRev?.estado);
    pedidoDoc = await Pedido.findOneAndUpdate(
      { _id: pedidoId, estado: { $in: ['pendiente', 'procesando'] } },
      { estado: 'procesando' },
      { new: true }
    );
    if (!pedidoDoc) {
      console.warn('[WORKER] pedido no encontrado o ya procesado:', pedidoId);
      return;
    }
    workingPayload = pedidoDoc.payload;
  }

  if (!workingPayload) {
    throw new Error('Payload vacío: se requiere `payload` o `pedidoId` válido');
  }

  try {
    const correlativo = await getNextCorrelativo();
    console.log('Procesando pedido:', pedidoId || '(inline)', 'Correlativo:', correlativo);

    // 1) preparar y enviar orden (según tu flujo actual)
    await crearPDF(
      workingPayload.cliente,
      workingPayload.vendedor,
      workingPayload.productos,
      correlativo,
      workingPayload.total
    );

    await sendOrder(
      workingPayload.cliente,
      workingPayload.productos,
      correlativo,
      workingPayload.emails
    );

    // 2) generar PDF final y enviar correos
    const pdfBuffer = await generarPDF(
      workingPayload.cliente,
      workingPayload.productos,
      workingPayload.total,
      workingPayload.items,
      workingPayload.notaPedido,
      correlativo,
      workingPayload.hora,
      workingPayload.vendedor
    );

    await emailer.sendMail(
      pdfBuffer,
      "pedidostoyoxpress@gmail.com",
      workingPayload.notaCorreo,
      correlativo,
      workingPayload.cliente?.Nombre
    );
    await emailer.sendMail(
      pdfBuffer,
      "toyoxpressca@gmail.com",
      workingPayload.notaCorreo,
      correlativo,
      workingPayload.cliente?.Nombre
    );
    await emailer.sendMail(
      pdfBuffer,
      "mamedina770@gmail.com",
      workingPayload.notaCorreo,
      correlativo,
      workingPayload.cliente?.Nombre
    );

    // 3) actualizar stock y reservas
    await Promise.all(
      (workingPayload.productos || []).map(async (p) => {
        await updateStock(p["Código"], p["cantidad"]);
        cancelarReserva(p["Código"], workingPayload.vendedor);
      })
    );

    // 4) persistencia final si el pedido existe en BD
    if (pedidoDoc) {
      pedidoDoc.estado = 'completado';
      pedidoDoc.correlativo = correlativo;
      pedidoDoc.procesadoEn = new Date();
      await pedidoDoc.save();
    }

    console.log('✅ Pedido completado');
    return { ok: true, correlativo };
  } catch (err) {
    if (pedidoDoc) {
      pedidoDoc.estado = 'error';
      pedidoDoc.error = err.message;
      await pedidoDoc.save();
    }
    console.error('❌ Error procesando pedido:', err);
    throw err;
  }
}

module.exports = { procesarPedido };
