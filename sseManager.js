const { io } = require("./server");

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


    res.write(`data: Welcome! Your client ID is: ${clientId}\n\n`);


    res.on('close', () => {
      clients.delete(clientId);
    });
  } catch (error) {
    console.error('Error adding client:', error);
  }
};

const sendToClients = (message) => {
  io.to("logs").emit("recibir_logs", message);
  console.log("Mensaje emitido a la sala 'logs':", message);
};

const sendError = (message) => {
  try {
    const lastClientId = Array.from(clients.keys()).pop(); // Obtener el ID del último cliente
    const lastClient = clients.get(lastClientId); // Obtener el último cliente del Map

    if (lastClient) {
    lastClient.write(`event: error\ndata: ${JSON.stringify({ message: 'Error sending message' })}\n\n`);
    } else {
      console.error('No clients available to send the message.');
    }
  } catch (error) {
    console.error('Error sending message to the last client:', error);
  }
};


// Enviar un evento de ping para mantener la conexión abierta
const sendPing = () => {
  clients.forEach((client) => {
    client.write('data: ping\n\n');
  });
};


setInterval(sendPing, 25000);
module.exports = {
  addClient,
  sendToClients,
  sendError
}