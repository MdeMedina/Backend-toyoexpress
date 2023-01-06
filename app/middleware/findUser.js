const express = require('express')
const User = require('../models/user')
const findAndAssignUser = async (req, res, next) => {
    try {    
    const user = await User.findById(req.auth._id)
    if (!user) {
        return res.status(401).end()
    }
    req.user = user
    next()
} catch (e) {
    next(e)
}
}

module.exports = findAndAssignUser