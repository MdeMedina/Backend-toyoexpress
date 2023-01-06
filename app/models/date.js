const mongoose = require('mongoose')

const Time = mongoose.model('Time', {
    apertura: {type: String, required: true},
    cierre: {type: String, required: true}
})

module.exports = Time