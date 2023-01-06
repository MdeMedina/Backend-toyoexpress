const mongoose = require('mongoose')

const Vmovimiento = mongoose.model('Vmovimiento', {
    identificador: {type: String, required: true},
    concepto: {type: String, required: true},
    monto: {type: String, required: true},
    fecha: {type: String, required: true},
    name:  {type: String, required: true},
    validacion: {type: String, required: true}
})

module.exports = Vmovimiento