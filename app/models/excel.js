const mongoose = require("mongoose");

const ExcelProductos = mongoose.model("Excel", {
  Código: { type: String, required: true },
  "Nombre Corto": { type: String, required: true },
  Referencia: { type: String },
  Marca: { type: String },
  Modelo: { type: String },
  "Existencia Actual": { type: Number},
  "Precio Oferta": { type: Number },
  "Precio Mayor": { type: Number },
  "Precio Minimo": { type: Number },
});

const ExcelClientes = mongoose.model("Clientes", {
  Rif: {type: String},
  "Nombre": {type: String},
  "Vendedor": {type: String},
  "Telefonos": {type: String},
  "Correo Electronico": {type: String},
  "Tipo de Precio": {type: String},
  "Estado": {type: String},
  "Ciudad": {type: String},
  "Municipio": {type: String},
  "Direccion": {type: String},
  "Vendedores Código":{type: String},
  "Ultima Venta Credito":{type: String}
});

module.exports = { ExcelProductos, ExcelClientes };
