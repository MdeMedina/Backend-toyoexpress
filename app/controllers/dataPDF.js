const dataPDF = require("../models/dataPDF");

const crearPDF = async (req, res) => {
  const { body } = req;
  try {
    const pdf = await dataPDF.create({
      cor: body.cor,
    });
    res.status(201).send(pdf);
  } catch (e) {
    httpError(res, e);
  }
};

const getPDF = async (req, res) => {
  let pdf = await dataPDF.find({});
  if (!pdf) {
    res.status(404).send("porfavor cree algunas cuentas!");
  } else {
    res.status(200).send(pdf);
  }
};

module.exports = { getPDF, crearPDF };
