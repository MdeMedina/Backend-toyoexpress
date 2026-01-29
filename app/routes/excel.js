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
  const requestStart = process.hrtime.bigint();
  res.once("finish", () => {
    const elapsedMs = Number(process.hrtime.bigint() - requestStart) / 1e6;
    const contentLength = res.getHeader("Content-Length");
    console.log(
      `✅ /excel/products finish ${res.statusCode} ${elapsedMs.toFixed(0)}ms` +
        (contentLength ? ` (${contentLength} bytes)` : "")
    );
  });
  res.once("close", () => {
    const elapsedMs = Number(process.hrtime.bigint() - requestStart) / 1e6;
    if (!res.writableEnded) {
      console.warn(`⚠️ /excel/products closed early after ${elapsedMs.toFixed(0)}ms`);
    }
  });

  console.time("⏱️ /products TOTAL");

  try {
    console.time("📥 Lectura y parseo de req.body");
    const { Código, pagina } = req.body;
    console.timeEnd("📥 Lectura y parseo de req.body");

    console.time("⚙️ Cálculo de paginación");
    const perPage = parseInt(process.env.PAGINA, 10) || 30;
    const page = Math.max(1, parseInt(pagina, 10) || 1);
    const offset = (page - 1) * perPage;
    console.timeEnd("⚙️ Cálculo de paginación");

    console.time("📦 Llamada a getExcelProductos");
    const datos = await getExcelProductos(Código, offset, perPage);
    console.timeEnd("📦 Llamada a getExcelProductos");

    console.time("📤 Serialización de respuesta (res.json)");
    res.json(datos);
    console.timeEnd("📤 Serialización de respuesta (res.json)");

    console.timeEnd("⏱️ /products TOTAL");
  } catch (error) {
    console.timeEnd("⏱️ /products TOTAL");
    console.error("❌ Error en /products:", error);
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
