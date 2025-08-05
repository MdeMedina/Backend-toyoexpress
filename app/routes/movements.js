const express = require(`express`);
const router = express.Router();
const {
  crearMovimiento,
  getMoves,
  modificarStatus,
  deleteMoves,
  modificarMovimiento,
  generarPDFData,
} = require("../controllers/movements");
const isAuthenticated = require("../middleware/isAuth");



function applyRegExpConditionSaldo(condition) {
  let newCond = {}
  for (let key in condition) {
        if (typeof condition[key] === 'string') {
          if (key == 'status') {
            newCond[key] = condition[key]
          } else{
            newCond[key] = new RegExp(condition[key], 'i'); // Crear una expresión regular insensible a mayúsculas/minúsculas para cada string
          }
        } else if (Array.isArray(condition[key])) {
          newCond[key] = condition[key]
        }
    }
    return newCond
}
function applyRegExpCondition(condition) {
  let newCond = {}
  for (let key in condition) {
        if (typeof condition[key] === 'string') {
          if (key == 'status') {
            newCond[key] = condition[key]
          } else {
            newCond[key] = new RegExp(condition[key], 'i'); // Crear una expresión regular insensible a mayúsculas/minúsculas para cada string
          }
        } else if (Array.isArray(condition[key])) {
          if (key == 'pago') {
            newCond[key] = condition[key]
          } else {
            newCond[key] = condition[key].map(value => new RegExp(value, 'i')); // Crear una expresión regular insensible a mayúsculas/minúsculas para cada elemento del array
          }
        }
    }
    return newCond
}

router.post("/movimiento", isAuthenticated ,crearMovimiento);
router.put("/updateStatus", isAuthenticated ,modificarStatus);
router.put("/updateMove", isAuthenticated,modificarMovimiento);
router.post("/PDF", isAuthenticated ,async (req, res) => {
      try {
      const {condition, fechas} = req.body;
      let conditionOld = applyRegExpConditionSaldo(condition)
      let conditionreg = applyRegExpCondition(condition)
      const datos = await generarPDFData(conditionreg, fechas, conditionOld);
      return res.json(datos);
    } catch (error) {
      return res.json({ errorMessage: error.message });
    }
});
router.post("/", isAuthenticated ,async (req, res) => {
      try {
      const {condition, pagina, cantidad, fechas, sort, vm, nm} = req.body;
      let conditionOld = applyRegExpConditionSaldo(condition)
      let page = pagina ? pagina : 1;
      let conditionreg = applyRegExpCondition(condition)
      page = page * parseInt(cantidad) - parseInt(cantidad);
      const datos = await getMoves(conditionreg, page, cantidad, fechas, conditionOld, sort, vm, nm);
      return res.json(datos);
    } catch (error) {
      return res.json({ errorMessage: error.message });
    }
});
router.put("/deleteMoves", isAuthenticated,deleteMoves);

module.exports = router;
