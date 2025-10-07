const User = require('../models/user')

const findAndAssignUser = async (req, res, next) => {
  console.time('⏱️ findAndAssignUser') // ⏱️ Inicia medición

  try {
    const user = await User.findById(req.auth._id)

    if (!user) {
      console.timeEnd('⏱️ findAndAssignUser') // 🛑 Finaliza si no hay usuario
      return res.status(401).end()
    }

    req.user = user
    console.timeEnd('⏱️ findAndAssignUser') // ✅ Termina medición
    next()
  } catch (error) {
    console.timeEnd('⏱️ findAndAssignUser') // ❌ Asegura cierre de medición incluso en error
    next(error)
  }
}

module.exports = findAndAssignUser