const mongoose = require("mongoose");

const Producto = mongoose.model("Producto", {
  name: String,
  sku: String,
  price: Number,
  regular_price: Number,
  sale_price: Number,
  manage_stock: Boolean,
  stock_quantity: Number,
  attributes: [{
    id: Number,
    name: String,
    position: Number,
    visible: Boolean,
    variation: Boolean,
    options: [String]
  }],
});

module.exports = { Producto };