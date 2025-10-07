require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const { dbConnect } = require("./config/mongo");
const { bodyParser } = require("body-parser");
const { addClient } = require('./sseManager');
const path = require('path');
const fs = require('fs');
const cors = require("cors");
const PORT = process.env.PORT;
const winston = require('winston');
dbConnect();

const app = express();
let server = http.createServer(app);
app.use((req,res,next)=>{
  const t0 = process.hrtime.bigint();
  res.on('finish', ()=>{
    const ms = Number(process.hrtime.bigint() - t0)/1e6;
    if (ms>300) console.warn(`[SLOW] ${req.method} ${req.originalUrl} ${res.statusCode} ${ms.toFixed(0)}ms`);
  });
  next();
});
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

app.use("/registros", require("./app/routes/pedidos"));
app.use(express.static("app"));


app.use("/reservas", require("./app/routes/reservas"));
app.use(express.static("app"));

app.use("/worker", require("./app/routes/worker"));
app.use(express.static("app"));



app.get('/events', (req, res) => {
  console.log("llegue a events index.js")
  addClient(res);
});

// Crear un logger con configuración personalizada
const logger = winston.createLogger({
  level: 'info', // Nivel mínimo de logs (puede ser 'error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
  format: winston.format.combine(
    winston.format.timestamp(), // Agrega marca de tiempo
    winston.format.json()       // Guarda logs en formato JSON
  ),
  transports: [
    // Transport para guardar logs en un archivo
    new winston.transports.File({ filename: 'logs/app.log' }),

    // (Opcional) Transport para mostrar los logs en consola
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});
global.shared = {};

global.shared.logInfo = (info) => {
  logger.info(`Mensaje enviado con exito! ${info}`);
;
};

global.shared.logError = (error) => {
  logger.error(`El error es el siguiente: ${error}`);
;
};

// Función para reiniciar el archivo de log
global.shared.resetLog = () => {
  const logFile = 'app.log';
  
  // Limpia el archivo de log
  fs.writeFile(logFile, '', (err) => {
  });
}


// Endpoint para servir el archivo de log
app.get('/download-logs', (req, res) => {
  const logFilePath = path.join(__dirname, 'logs', 'app.log');
  
  // Verificar si el archivo existe
  if (fs.existsSync(logFilePath)) {
    res.download(logFilePath, 'app.log', (err) => {
      if (err) {
        res.status(500).send('Error al descargar el archivo.');
      }
    });
  } else {
    res.status(404).send('El archivo de log no se encuentra.');
  }
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
    origin: 'http://localhost:3000', // Reemplaza con el origen de tu frontend
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

    socket.on('keepAlive', () => {
    console.log(`Keep-alive recibido de: ${socket.id}`);
  });

  socket.on("send_aprove", (data) => {
    socket.to(data.messageId).emit("receive_aprove", data);
  });

  socket.on("send_correlativo", (data) => {
  // Enviar el nuevo correlativo a todos en la sala "correlativo"
    socket.to("correlativo").emit("update_correlativo", data);
  });
});



global.shared.sendToClients = (message) => {
  io.to("logs").emit("recibir_logs", message);
  console.log("Mensaje emitido a la sala 'logs':", message);
};

global.shared.sendFecha = (message) => {
  io.to("UF").emit("recibir_fecha", message);
;
};


server.listen(PORT, '0.0.0.0', () => {
  console.log("listening in port " + PORT);
});

