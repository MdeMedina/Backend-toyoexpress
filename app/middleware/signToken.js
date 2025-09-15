const jsonwebtoken = require('jsonwebtoken')
const signToken = _id => jsonwebtoken.sign({ _id}, process.env.SECRET, {expiresIn: '3h'})

module.exports = signToken
