const express = require(`express`);
const {
  getWoo,
} = require("../controllers/orders");
const router = express.Router();

router.get("/", getWoo)

module.exports = router;
