const express = require(`express`);
const router = express.Router();
const {
  crearIngreso,
  crearEgreso,
  getMoves,
  modificarStatus,
  deleteMoves,
  modificarMovimiento,
} = require("../controllers/movements");

router.post("/ingreso", crearIngreso);
router.put("/updateStatus", modificarStatus);
router.put("/updateMove", modificarMovimiento);
router.get("/", getMoves);

router.post("/egreso", crearEgreso);
router.put("/deleteMoves", deleteMoves);

module.exports = router;
