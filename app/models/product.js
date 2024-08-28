const mongoose = require("mongoose");

const Producto = mongoose.model("Producto", {
  name: String,
  sku: String,
  price: String,
  regular_price: String,
  sale_price: String,
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
    meta_data: [
  { id: Number, key: String, value: String },
  { id: Number, key: String, value: String },
  ],
});

module.exports = { Producto };