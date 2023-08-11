const express = require(`express`);
const {
  getExcelProductos,
  getCompleteExcelProductos,
  getExcelClientes,
  updateExcelClientes,
  updateExcelProductos,
  updateStock,
  fechaAct,
  fechaget,
} = require("../controllers/excel");
const router = express.Router();

router.get("/productsComplete", getCompleteExcelProductos);
router.get("/fecha", fechaget);
router.post("/products", getExcelProductos);
router.post("/clients", getExcelClientes);
router.put("/updateProducts", updateExcelProductos);
router.put("/stock", updateStock);
router.put("/actFecha", fechaAct);
router.put("/updateClients", updateExcelClientes);

module.exports = router;
