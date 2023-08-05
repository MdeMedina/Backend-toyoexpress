const express = require(`express`);
const {
  getExcelProductos,
  getCompleteExcelProductos,
  getExcelClientes,
  updateExcelClientes,
  updateExcelProductos,
} = require("../controllers/excel");
const router = express.Router();

router.get("/productsComplete", getCompleteExcelProductos);
router.post("/products", getExcelProductos);
router.post("/clients", getExcelClientes);
router.put("/updateProducts", updateExcelProductos);

router.put("/updateClients", updateExcelClientes);

module.exports = router;
