const { formatDateHoy } = require("../helpers/dates/dates");
const { DateTime } = require("luxon");
const Time = require('../models/date')

const checkearHorario = async (req, res, next) => {
    let date = await Time.find({})
    date = date[0]
    const {apertura, cierre} = date
    const ahora_mismo = DateTime.now().setZone("America/Santiago")


    const hoy = `${formatDateHoy(new Date())} ${apertura}` // 2022-10-25T10:00
    const hoy_cierre = `${formatDateHoy(new Date())} ${cierre}` // 2022-10-25T20:00

    const apertura_final = DateTime.fromSQL(hoy)
    const cierre_final = DateTime.fromSQL(hoy_cierre)

    if(ahora_mismo >= cierre_final || ahora_mismo < apertura_final){
        // FUERA DE AQUI
        return res.status(401).json({ errormessage: `No se puede ingresar, el sitio abre de nuevo a las ${apertura}, por favor intentelo de nuevo a esa hora` })
    } else {
        next()
    }
}

module.exports = {
    checkearHorario
}