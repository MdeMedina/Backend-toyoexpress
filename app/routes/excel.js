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
router.post("/products", async (req, res) => {
      try {
      const { Código, pagina} = req.body;
      let page = pagina ? pagina : 1;
      page = page * parseInt(process.env.PAGINA) - parseInt(process.env.PAGINA);
      const datos = await getExcelProductos(Código, page);
      return res.json(datos);
    } catch (error) {
      return res.json({ errorMessage: error.message });
    }
});
router.post("/clients", async (req, res) => {
      try {
      const {Nombre, pagina} = req.body;
      let page = pagina ? pagina : 1;
      page = page * parseInt(process.env.PAGINA) - parseInt(process.env.PAGINA);
      const datos = await getExcelClientes(Nombre, page);
      return res.json(datos);
    } catch (error) {
      return res.json({ errorMessage: error.message });
    }
});
router.put("/updateProducts", updateExcelProductos);
router.put("/stock", updateStock);
router.put("/actFecha", fechaAct);
router.put("/updateClients", updateExcelClientes);

module.exports = router;
