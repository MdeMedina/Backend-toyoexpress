const express = require('express')
const validateJwt = require('./validateJwt')
const findAndAssignUser = require('./findUser')
const isAuthenticated = express.Router().use(validateJwt, findAndAssignUser)

module.exports = isAuthenticated