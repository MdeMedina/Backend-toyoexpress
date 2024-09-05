let clients = new Map(); // Utilizando un Map para almacenar clientes con ID

const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};

const addClient = async (res) => {
  try {
    const clientId = generateUniqueId(); // Genera un ID único para el cliente
    clients.set(clientId, res);

    await res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    });

console.log("Salimos del pending")

    res.write(`data: Welcome! Your client ID is: ${clientId}\n\n`);


    res.on('close', () => {
      clients.delete(clientId);
    });
  } catch (error) {
    console.error('Error adding client:', error);
  }
};

const sendToClients = (message) => {
  client = clients[clients.length-1]
    try {
      client.write(`data: ${JSON.stringify(message)}\n\n`);
    } catch (error) {
      console.error('Error sending message to client:', error);
    }
  }

module.exports = {
  addClient,
  sendToClients
}