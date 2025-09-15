const express = require(`express`);
const {
  makeProducts,
  assingProducts
} = require("../controllers/products");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuth");


router.post("/", isAuthenticated,makeProducts)
router.post("/assing" ,assingProducts)
//comentario

module.exports = router;
