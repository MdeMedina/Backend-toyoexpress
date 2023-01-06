const {expressjwt: jwt} = require('express-jwt')
const validateJwt = jwt({secret: process.env.SECRET, algorithms: ['HS256']})

module.exports = validateJwt