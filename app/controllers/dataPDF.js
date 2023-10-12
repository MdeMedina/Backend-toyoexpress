const dataPDF = require("../models/dataPDF");

const crearPDF = async (req, res) => {
  let data = await dataPDF.find({});
  data = data[data.length - 1].cor;
  data = data + 1;
  try {
    const pdf = await dataPDF.create({
      cor: data,
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
