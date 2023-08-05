const mongoose = require("mongoose");

const ExcelProductos = mongoose.model("Excel", {
  Código: { type: String, required: true },
  "Nombre Corto": { type: String, required: true },
  Referencia: { type: String },
  Marca: { type: String },
  Modelo: { type: String },
  "Existencia Actual": { type: String },
  "Precio Oferta": { type: Number },
  "Precio Mayor": { type: Number },
  "Precio Minimo": { type: Number },
});

const ExcelClientes = mongoose.model("Clientes", {
  Código: { type: String, required: true },
  Nombre: { type: String, required: true },
  "Persona Contacto": { type: String },
  Teléfonos: { type: String },
  Fax: { type: String },
  "Correo Electrónico": { type: String },
  "Limite Credito": { type: String },
  "Dias Credito": { type: String },
  "Credito Disponible": { type: String },
  "Precio de Venta": { type: String },
  "Ultima Venta a Contado": { type: String },
  "Ultima Venta a Crédito": { type: String },
  "Vendedores Código": { type: String },
  "Vendedores Nombre": { type: String },
});

module.exports = { ExcelProductos, ExcelClientes };
