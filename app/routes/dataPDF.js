const express = require(`express`);
const router = express.Router();
const { getPDF, crearPDF } = require("../controllers/dataPDF");
const isAuthenticated = require("../middleware/isAuth");

router.post("/", isAuthenticated,getPDF);

router.post("/create", isAuthenticated,crearPDF);

module.exports = router;
