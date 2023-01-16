const mongoose = require("mongoose");

const Cuenta = mongoose.model("Time", {
  name: { type: String, required: true },
  color: { type: String, required: true },
});

module.exports = Cuenta;
