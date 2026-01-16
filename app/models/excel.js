const { text } = require("body-parser");
const mongoose = require("mongoose");

// Definir el schema con índices
const excelProductosSchema = new mongoose.Schema({
  Código: { type: String, required: true, index: true }, // Índice para búsquedas rápidas
  "Nombre Corto": { type: String, required: true },
  Referencia: { type: String },
  Marca: { type: String },
  Modelo: { type: String },
  "Existencia Actual": { type: Number},
  "Precio Oferta": { type: Number },
  "Precio Mayor": { type: Number },
  "Precio Minimo": { type: Number },
}, {
  timestamps: false // Desactivar timestamps si no los necesitas
});

// Crear índice compuesto para optimizar búsquedas con sort
excelProductosSchema.index({ Código: 1, _id: -1 });

// Evitar redefinir el modelo si ya existe
const ExcelProductos = mongoose.models.Excel || mongoose.model("Excel", excelProductosSchema);

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
