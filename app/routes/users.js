const express = require(`express`);
const router = express.Router();
const {
  registerUser,
  loginUser,
  authUser,
  getUsers,
  actUser,
  deleteUsers,
  actNumber,
  actNotificaciones,
  actInactive,
  getInactive,
  actPass,
  getHour,
} = require("../controllers/users");
const { checkearHorario } = require("../middleware/checkTime");
const isAuthenticated = require("../middleware/isAuth");

router.post("/register", isAuthenticated,registerUser);
router.put("/updateUser", isAuthenticated,actUser);
router.put("/actualizarCantidad", isAuthenticated,actNumber);
router.put("/actNotificaciones", isAuthenticated,actNotificaciones);
router.delete("/deleteUser", isAuthenticated ,deleteUsers);
router.post("/login", loginUser);
router.get("/auth", isAuthenticated, authUser);
router.get("/hour", getHour);
router.get("/", isAuthenticated,getUsers);
router.put("/actInactive", isAuthenticated,actInactive);
router.post("/inactive", isAuthenticated,getInactive);
router.post("/actpass", isAuthenticated ,actPass);

module.exports = router;
