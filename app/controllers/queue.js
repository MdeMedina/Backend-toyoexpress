// src/services/encolarPedido.js
const Pedido = require('../models/pedido');
const { SQSClient, SendMessageCommand } = require('@aws-sdk/client-sqs');

const sqs = new SQSClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_DEV,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_DEV
  }
});

const QUEUE_URL = process.env.SQS_QUEUE_URL;
const GROUP_ID  = process.env.SQS_GROUP_ID || 'orders';

async function encolarPedido(payload) {
  const pedido = await Pedido.create({
    estado: 'pendiente',
    creadoEn: new Date(),
    payload
  });

  const message = {
    pedidoId: pedido._id.toString(),
    payload,
    ts: Date.now()
  };

  const params = {
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(message),
    MessageGroupId: (payload?.clienteId?.toString?.()) || GROUP_ID,
    MessageDeduplicationId: message.pedidoId
  };

  try {
    const out = await sqs.send(new SendMessageCommand(params));
    await Pedido.updateOne(
      { _id: pedido._id },
      { estado: 'enviado', sqsMessageId: out.MessageId }
    );

    console.log('Pedido encolado:', pedido._id, 'msgId:', out.MessageId);
    return { pedidoId: pedido._id, messageId: out.MessageId };
  } catch (err) {
    console.error('Error al encolar en SQS:', err);
    await Pedido.updateOne(
      { _id: pedido._id },
      { estado: 'error', error: String(err) }
    );
    throw err;
  }
}

module.exports = { encolarPedido };
