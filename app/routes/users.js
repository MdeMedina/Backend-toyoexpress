const express = require(`express`)
const router = express.Router()
const { registerUser, loginUser, authUser, getUsers, actUser, deleteUsers} = require('../controllers/users')
const { checkearHorario } = require('../middleware/checkTime')
const isAuthenticated = require('../middleware/isAuth')

router.post('/register', registerUser)
router.put('/updateUser', actUser)
router.delete('/deleteUser', deleteUsers)
router.post('/login', loginUser)
router.get('/auth', isAuthenticated, authUser)
router.get('/', getUsers)

module.exports = router