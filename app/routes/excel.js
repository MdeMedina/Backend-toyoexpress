const express = require(`express`);
const {
  getExcelProductos,
  getExcelClientes,
  updateExcelClientes,
  updateExcelProductos,
} = require("../controllers/excel");
const router = express.Router();

router.get("/products", getExcelProductos);
router.put("/clients", getExcelClientes);
router.post("/updateProducts", updateExcelProductos);
router.delete("/updateClients", updateExcelClientes);

module.exports = router;
