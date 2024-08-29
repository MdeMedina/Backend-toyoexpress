let clients = [];

// Función para añadir un cliente SSE
const addClient = (res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.push(res);

  res.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
};

// Función para enviar un mensaje a todos los clientes
const sendToClients = (message) => {
  console.log("Entre en sendClients y este es mi message", message)
  clients.forEach(client => client.write(`data: ${JSON.stringify(message)}\n\n`));
};

module.exports = {
  addClient,
  sendToClients,
};
