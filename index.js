require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const mongoose = require("mongoose");
const { dbConnect } = require("./config/mongo");
const cors = require("cors");
const PORT = process.env.PORT;
dbConnect();

const app = express();
let server = http.createServer(app);

app.use(express.json());
app.use(cors());

app.use("/users", require("./app/routes/users"));
app.use(express.static("app"));

app.use("/moves", require("./app/routes/movements"));
app.use(express.static("app"));

app.use("/dates", require("./app/routes/dates"));
app.use(express.static("app"));

app.use("/cuentas", require("./app/routes/cuentas"));
app.use(express.static("app"));

let io = new Server(server, {
  cors: {
    origin: "http://front.toyoxpress.com/",
    methods: ["GET", "POST", "UPDATE"],
  },
});

let nots = [];
io.on("connection", (socket) => {
  socket.on("move", (data) => {
    socket.broadcast.emit("move", data);
  });
});

server.listen(PORT, () => {
  console.log("listening in port " + PORT);
});
