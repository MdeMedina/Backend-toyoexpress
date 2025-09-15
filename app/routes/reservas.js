const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/isAuth");
const { reservarStock, verificarReserva } = require("../controllers/reserva");
router.post("/", isAuthenticated, async (req, res) => {
    try {
    const { body } = req;
    console.log(body);
    let send = await verificarReserva(body.code, body.user);
  
    console.log(send);
    if (send) {
        res.status(200).send(send);
    } else {
        res.status(200).send(null);
    }
} catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error al procesar el pedido" });
}
  });

  router.post("/crear", isAuthenticated, async (req, res) => {
    try {
    const { body } = req;
    console.log(body);
    await reservarStock(body.code, body.cantidad, body.user);
    res.status(201)
} catch (error) {
    console.log(error);
    res.status(500).send({ error: "Error al procesar la reserva" });
}
  });

module.exports = router;