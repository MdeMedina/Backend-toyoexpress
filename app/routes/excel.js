const express = require(`express`);
const {
  getExcelProductos,
  getExcelClientes,
  updateExcelClientes,
  updateExcelProductos,
} = require("../controllers/excel");
const router = express.Router();

router.get("/", async (req, res) => {
    res.status(200).send("hola");
})
router.get("/products", getExcelProductos);
router.get("/clients", getExcelClientes);
router.put("/updateProducts", updateExcelProductos);
router.put("/updateClients", updateExcelClientes);

module.exports = router;
