const { expressjwt: jwt } = require('express-jwt');

const validateJwt = jwt({
  secret: process.env.SECRET,
  algorithms: ['HS256'],
  requestProperty: 'auth', // opcional, define dónde se guarda el payload
  async: true, // 👈 fuerza verificación asíncrona (si la lib lo permite)
  onExpired: (req, err) => {
    console.warn("⚠️ Token expirado:", err.message);
  }
});

module.exports = (req, res, next) => {
  console.time("🔐 validateJwt");
  validateJwt(req, res, (err) => {
    console.timeEnd("🔐 validateJwt");
    if (err) {
      console.error("❌ Error JWT:", err.message);
      return res.status(401).json({ error: "Token inválido o expirado" });
    }
    next();
  });
};
