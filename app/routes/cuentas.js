const express = require(`express`);
const {
  getCuentas,
  actCuenta,
  crearCuenta,
} = require("../controllers/cuentas");
const router = express.Router();

router.get("/", getCuentas);
router.put("/actualizarCuenta", actCuenta);
router.post("/crearCuenta", crearCuenta);

module.exports = router;
