let clients = [];

// Función para añadir un cliente SSE
const addClient = (res) => {
 res.writeHead(200, {
    'Content-Type': 'text/event-stream',   

    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  });
  clients.push(res);
  console.log("Entre al manage")

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
