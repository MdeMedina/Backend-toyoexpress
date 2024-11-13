require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const { dbConnect } = require("./config/mongo");
const { bodyParser } = require("body-parser");
const { addClient } = require('./sseManager');
const path = require('path');
const cors = require("cors");
const PORT = process.env.PORT;
dbConnect();

const app = express();
let server = http.createServer(app);

app.use(express.json({ limit: "10mb" }));
app.use(cors({
  origin: 'http://localhost:3000', // Reemplaza con el origen de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/users", require("./app/routes/users"));
app.use(express.static("app"));
app.use("/pdf", require("./app/routes/dataPDF"));
app.use(express.static("app"));

app.get('/events', (req, res) => {
  console.log("llegue a events index.js")
  addClient(res);
});

const logFilePath = path.join(__dirname, 'backend_logs', 'logs.txt');

// Endpoint para descargar el archivo de logs
app.get('/download-logs', (req, res) => {
  res.download(logFilePath, 'logs.txt', (err) => {
    if (err) {
      console.error('Error al descargar el archivo:', err);
      res.status(500).send('Error al descargar el archivo.');
    }
  });
});

app.use("/excel", require("./app/routes/excel"));
app.use(express.static("app"));

app.use("/moves", require("./app/routes/movements"));
app.use(express.static("app"));

app.use("/dates", require("./app/routes/dates"));
app.use(express.static("app"));

app.use("/upload", require("./app/routes/upload"));
app.use(express.static("app"));

app.use("/orders", require("./app/routes/orders"));
app.use(express.static("app"));

app.use("/products", require("./app/routes/productos"));
app.use(express.static("app"));

app.use("/cuentas", require("./app/routes/cuentas"));
app.use(express.static("app"));

let io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "UPDATE"],
  },
});

let nots = [];
io.on("connection", (socket) => {
  socket.on("move", (data) => {
    socket.broadcast.emit("move", data);
  });

  socket.on("join_room", (data) => {
    socket.join(data);
  });

  socket.on("send_aprove", (data) => {
    socket.to(data.messageId).emit("receive_aprove", data);
  });

  socket.on("send_correlativo", (data) => {
  // Enviar el nuevo correlativo a todos en la sala "correlativo"
    socket.to("correlativo").emit("update_correlativo", data);
  });
});


global.shared = {};
global.shared.sendToClients = (message) => {
  io.to("logs").emit("recibir_logs", message);
  console.log("Mensaje emitido a la sala 'logs':", message);
};

global.shared.sendFecha = (message) => {
  io.to("UF").emit("recibir_fecha", message);
;
};


server.listen(PORT, () => {
  console.log("listening in port " + PORT);
});
