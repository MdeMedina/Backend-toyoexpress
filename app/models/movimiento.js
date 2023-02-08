const mongoose = require('mongoose')

const Ingreso = mongoose.model('Ingreso', {
    identificador: {type: String, required: true},
    email: {type: String, required: true},
    cuenta: {type: String, required: true},
    concepto: {type: String, required: true},
    pago: {type: String, required: true},
    monto: {type: String, required: true},
    bs: {type: Number},
    change: {type: Number},
    fecha: {type: String, required: true},
    name:  {type: String, required: true},
    vale: {type: String},
    aFecha: {type: String},
    disabled: {type: Boolean, required: true},
    messageId: {type: Number, required: true}
})

const Egreso = mongoose.model('Egreso', {
    identificador: {type: String, required: true},
    email: {type: String, required: true},
    cuenta: {type: String, required: true},
    concepto: {type: String, required: true},
    pago: {type: String, required: true},
    bs: {type: Number},
    change: {type: Number},
    monto: {type: String, required: true},
    fecha: {type: String, required: true},
    name:  {type: String, required: true},
    vale: {type: String},
    aFecha: {type: String},
    messageId: {type: Number, required: true},
    disabled: {type: Boolean, required: true}
})


module.exports = {Ingreso, Egreso}