const mongoose = require('mongoose')

const User = mongoose.model('User', {
    email: {type: String, required: true},
    username: {type: String, required: true},
    permissions: {type: Object, required: true},
    password: {type: String, required: true},
    salt: {type: String, required: true},
    cantidadM: {type: Number}
})

module.exports = User