const express = require(`express`);
const {
  makeProducts,
  assingProducts
} = require("../controllers/products");
const router = express.Router();

router.post("/", makeProducts)
router.post("/assing", assingProducts)
//comentario

module.exports = router;
