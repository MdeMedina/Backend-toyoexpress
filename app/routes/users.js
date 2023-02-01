const express = require(`express`)
const router = express.Router()
const { registerUser, loginUser, authUser, getUsers, actUser, deleteUsers, actNumber, actNotificaciones} = require('../controllers/users')
const { checkearHorario } = require('../middleware/checkTime')
const isAuthenticated = require('../middleware/isAuth')

router.post('/register', registerUser)
router.put('/updateUser', actUser)
router.put('/actualizarCantidad', actNumber)
router.put('/actNotificaciones', actNotificaciones)
router.delete('/deleteUser', deleteUsers)
router.post('/login', loginUser)
router.get('/auth', isAuthenticated, authUser)
router.get('/', getUsers)

module.exports = router