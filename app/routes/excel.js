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
const isAuthenticated = require("../middleware/isAuth");
const router = express.Router();

router.get("/productsComplete", isAuthenticated ,getCompleteExcelProductos);
router.get("/fecha", isAuthenticated ,fechaget);
router.post("/products", isAuthenticated, async (req, res) => {
  try {
    const { Código, pagina } = req.body;
    const perPage = parseInt(process.env.PAGINA, 10) || 30;
    const page = Math.max(1, parseInt(pagina, 10) || 1);
    const offset = (page - 1) * perPage;

    const datos = await getExcelProductos(Código, offset, perPage);
    return res.json(datos);
  } catch (error) {
    return res.json({ errorMessage: error.message });
  }
});

router.post("/clients", isAuthenticated ,async (req, res) => {
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
router.put("/updateProducts", isAuthenticated,updateExcelProductos);
router.put("/stock", isAuthenticated,updateStock);
router.put("/actFecha", isAuthenticated,fechaAct);
router.put("/updateClients", isAuthenticated,updateExcelClientes);

module.exports = router;
