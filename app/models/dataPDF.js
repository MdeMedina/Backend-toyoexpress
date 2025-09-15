const mongoose = require("mongoose");

const schema = mongoose.Schema({
  cor: { type: Number, required: true },
  cliente: { type: String, required: true },
  vendedor: { type: String, required: true },
  fecha: { type: Date, required: true },
  productos: {type: Array, required: true},
  total: { type: String, required: true },
});

schema.index({  cor: 'text',
  cliente: 'text',
  vendedor: 'text',
  fecha: 'text',
});

const dataPDF = mongoose.model("dataPDF", schema);

module.exports = dataPDF;
