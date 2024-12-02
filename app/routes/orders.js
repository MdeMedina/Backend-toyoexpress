const express = require("express");
const router = express.Router();
const { sendOrder } = require("../controllers/orders");

router.post("/", async (req, res) => {
  const { body } = req;
  const { dataClient } = body;

  await sendOrder(dataClient.client, dataClient.cart, dataClient.corr, dataClient.emails)
  res.send(200)
});

module.exports = router;
