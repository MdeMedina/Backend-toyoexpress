
const User = require('../models/user');
const NodeCache = require('node-cache');
const userExistsCache = new NodeCache({ stdTTL: 3600 }); // 1 hora

const findAndAssignUser = async (req, res, next) => {
  try {
    const userId = req.auth._id.toString();
    
    // Verifica cache primero
    if (userExistsCache.has(userId)) {
      req.user = req.auth; // Usa data del token
      return next();
    }

    // Solo verifica que existe (sin traer data)
    const exists = await User.exists({ _id: userId });
    
    if (!exists) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    userExistsCache.set(userId, true);
    req.user = req.auth; // Usa data del token
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = findAndAssignUser;
