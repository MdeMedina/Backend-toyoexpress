const express = require(`express`);
const router = express.Router();
const {
  crearMovimiento,
  getMoves,
  modificarStatus,
  deleteMoves,
  modificarMovimiento,
} = require("../controllers/movements");

router.post("/movimiento", crearMovimiento);
router.put("/updateStatus", modificarStatus);
router.put("/updateMove", modificarMovimiento);
router.get("/", getMoves);
router.put("/deleteMoves", deleteMoves);

module.exports = router;
