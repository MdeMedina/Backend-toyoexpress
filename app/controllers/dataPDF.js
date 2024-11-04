const dataPDF = require("../models/dataPDF");

const crearPDF = async (req, res) => {
  let data = await dataPDF.findOne({}, null, { sort: { cor: -1 } });
  
  try {
    let pdf = await dataPDF.findOneAndUpdate(
    { _id: data._id }, // Filtro: Busca el documento por su ID
    { $set: { cor: data.cor+1 } }, // Actualización: Establece el campo `status` a "procesado"
      { new: true, upsert: false } // Opciones: devuelve el documento actualizado, no crea uno nuevo si no lo encuentra
      );

console.log(pdf);

    res.status(201).send(pdf);
  } catch (e) {
    httpError(res, e);
  }
};

const getPDF = async (req, res) => {
let pdf = await dataPDF.findOne({}, null, { sort: { cor: -1 } });
console.log("Nuevo pdf: ", pdf)
  if (!pdf) {
    res.status(404).send("porfavor cree algunas cuentas!");
  } else {
    res.status(200).send(pdf);
  }
};

module.exports = { getPDF, crearPDF };
