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
const FechaMonto = mongoose.model("FechaMonto", {
  fecha: { type: Date, required: true },
  cuentas: { type: Object, required: true },
  pay_type: {type: Object, required: true},
  monto: { type: Number },
  cajaChica: {type: Number},
  usuarios: {type: Object, required: true}
});

module.exports = { FechaMonto };