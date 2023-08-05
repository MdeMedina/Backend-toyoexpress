const express = require(`express`);
const router = express.Router();
const { getPDF, crearPDF } = require("../controllers/dataPDF");

router.get("/", getPDF);

router.post("/create", crearPDF);

module.exports = router;
