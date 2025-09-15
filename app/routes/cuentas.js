const express = require(`express`);
const {
  getCuentas,
  actCuenta,
  crearCuenta,
  deleteCuentas,
} = require("../controllers/cuentas");
const isAuthenticated = require("../middleware/isAuth");
const router = express.Router();

router.get("/", isAuthenticated ,getCuentas);
router.put("/actualizarCuenta", isAuthenticated ,actCuenta);
router.post("/crearCuenta", isAuthenticated ,crearCuenta);
router.delete("/eliminarCuenta", isAuthenticated ,deleteCuentas);

module.exports = router;
