// routes/worker.js
const express = require('express');
const router = express.Router();
const { procesarPedido } = require('../controllers/worker');

// POST /api/procesar-cola
// body: { pedidoId?: string, payload?: {...} }
router.post('/procesar-cola', async (req, res) => {
  try {
    const { pedidoId, payload } = req.body || {};
    const result = await procesarPedido({ pedidoId, payload });
    res.status(200).json({ ok: true, ...result });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
