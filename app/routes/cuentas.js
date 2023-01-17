const express = require(`express`);
const {
  getCuentas,
  actCuenta,
  crearCuenta,
  deleteCuentas,
} = require("../controllers/cuentas");
const router = express.Router();

router.get("/", getCuentas);
router.put("/actualizarCuenta", actCuenta);
router.post("/crearCuenta", crearCuenta);
router.delete("/eliminarCuenta", deleteCuentas);

module.exports = router;
