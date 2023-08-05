const mongoose = require("mongoose");

const dataPDF = mongoose.model("dataPDF", {
  cor: { type: Number, required: true },
});

module.exports = dataPDF;
