const User = require('../models/user');
const NodeCache = require('node-cache');
const userExistsCache = new NodeCache({ stdTTL: 3600 });

const findAndAssignUser = async (req, res, next) => {
  console.time('⏱️ findAndAssignUser TOTAL');
  
  try {
    console.time('📝 userId.toString()');
    const userId = req.auth._id.toString();
    console.timeEnd('📝 userId.toString()');
    
    // Verifica cache primero
    console.time('🔍 Cache check');
    const hasCache = userExistsCache.has(userId);
    console.timeEnd('🔍 Cache check');
    
    if (hasCache) {
      console.log('✅ CACHE HIT - Sin query a DB');
      req.user = req.auth;
      console.timeEnd('⏱️ findAndAssignUser TOTAL');
      return next();
    }
    
    console.log('❌ CACHE MISS - Consultando DB');

    // Solo verifica que existe (sin traer data)
    console.time('🗄️ User.exists() query');
    const exists = await User.exists({ _id: userId });
    console.timeEnd('🗄️ User.exists() query');
    
    if (!exists) {
      console.timeEnd('⏱️ findAndAssignUser TOTAL');
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    console.time('💾 Cache set');
    userExistsCache.set(userId, true);
    console.timeEnd('💾 Cache set');
    
    req.user = req.auth;
    console.timeEnd('⏱️ findAndAssignUser TOTAL');
    next();
  } catch (error) {
    console.error('💥 Error en findAndAssignUser:', error.message);
    console.timeEnd('⏱️ findAndAssignUser TOTAL');
    next(error);
  }
}

module.exports = findAndAssignUser;