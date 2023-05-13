const mongoose = require("mongoose");

const ExcelProductos = mongoose.model("Excel", {
  Código: { type: String, required: true },
  "Nombre Corto": { type: String, required: true },
  Referencia: { type: String, required: true },
  Marca: { type: String, required: true },
  Modelo: { type: String, required: true },
  "Existencia Actual": { type: String, required: true },
  "Precio Oferta": { type: Number, required: true },
  "Precio Mayor": { type: Number, required: true },
  "Precio Minimo": { type: Number, required: true },
});

const ExcelClientes = mongoose.model("Clientes", {
  Código: { type: String, required: true },
  Nombre: { type: String, required: true },
  "Persona Contacto": { type: String, required: true },
  Teléfonos: { type: String, required: true },
  Fax: { type: String, required: true },
  "Correo Electrónico": { type: String, required: true },
  "Limite Credito": { type: String, required: true },
  "Dias Credito": { type: String, required: true },
  "Credito Disponible": { type: String, required: true },
  "Precio de Venta": { type: String, required: true },
  "Ultima Venta a Contado": { type: String, required: true },
  "Ultima Venta a Crédito": { type: String, required: true },
});

module.exports = { ExcelProductos, ExcelClientes };
