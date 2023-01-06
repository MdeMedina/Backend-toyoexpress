const express = require(`express`)
const router = express.Router()
const {crearIngreso, crearEgreso, getMoves, modificarStatus, deleteMoves} = require('../controllers/movements')

router.post('/ingreso', crearIngreso)
router.put('/updateStatus', modificarStatus)
router.get('/', getMoves)

router.post('/egreso', crearEgreso)
router.delete('/deleteMoves', deleteMoves)

module.exports = router