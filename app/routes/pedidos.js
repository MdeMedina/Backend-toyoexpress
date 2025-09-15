const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuth");
const { encolarPedido } = require("../controllers/queue");

router.post("/", isAuthenticated, async (req, res) => {
    try {
    const { body } = req;
    console.log(body);
    let send = await encolarPedido(body.data);
  
    console.log(send);
    res.status(200).send(send);
} catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error al procesar el pedido" });
}
  });

module.exports = router;