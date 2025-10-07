const User = require('../models/user')

const findAndAssignUser = async (req, res, next) => {
  console.time('⏱️ findAndAssignUser')

  try {
    console.time('🔍 findById query')
const user = await User.findById(req.auth._id)
  .lean()
  .explain('executionStats') // 👈 te dice qué está pasando

console.log('📊 Stats:', user.executionStats)

    console.timeEnd('🔍 findById query')

    if (!user) {
      console.timeEnd('⏱️ findAndAssignUser')
      return res.status(401).end()
    }

    req.user = user
    console.timeEnd('⏱️ findAndAssignUser')
    next()
  } catch (error) {
    console.timeEnd('⏱️ findAndAssignUser')
    next(error)
  }
}

module.exports = findAndAssignUser