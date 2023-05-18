const mongoose = require("mongoose");
const fechas = new Date(Date.now());
const dia = fechas.getDate();
let mes = fechas.getMonth();
mes = mes + 1;
const year = fechas.getFullYear();
const hora = fechas.getHours();
const minutos = fechas.getMinutes();
const segundos = fechas.getSeconds();

const fechaHoy = `${dia}/${mes}/${year} ${hora}:${minutos}:${segundos}`;
const Movimiento = mongoose.model("Movimiento", {
  identificador: { type: String, required: true },
  email: { type: String, required: true },
  cuenta: { type: String, required: true },
  concepto: { type: String, required: true },
  efectivo: { type: Number },
  zelle: { type: Number },
  bs: { type: Number },
  change: { type: Number },
  dollars: { type: Number },
  otro: { type: Number },
  monto: { type: String, required: true },
  fecha: { type: String, required: true },
  name: { type: String, required: true },
  vale: { type: String },
  aFecha: { type: String },
  messageId: { type: Number, required: true },
  disabled: { type: Boolean, required: true },
  creado: { type: String, default: fechaHoy },
});

module.exports = { Movimiento };
