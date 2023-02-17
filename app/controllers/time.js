const Time = require("../models/date");

const getTime = async (req, res) => {
  let dates = await Time.find({});
  dates = dates[0];
  if (!dates) {
    res.status(404).send("please create a date!");
  } else {
    res.status(200).send(dates);
  }
};

const updateTime = async (req, res) => {
  let dates = await Time.find({});
  dates = dates[0];
  const { body } = req;
  if (!dates) {
    const date = await Time.create({
      apertura: body.apertura,
      cierre: body.cierre,
    });
    res.status(200).send({
      response: `Horario creado con exito, abrira a las ${date.apertura} y cerrara a las ${date.cierre}`,
    });
  } else {
    dateId = dates._id;
    await Time.findOneAndUpdate(dateId, body, (err, updatedDate) => {
      if (err) {
        res
          .status(500)
          .send({ errorMessage: "error al actualizar el horario" });
      }
      {
        res.status(200).send({
          response: `Horario actualizado con exito, abrira a las ${body.apertura} y cerrara a las ${body.cierre}`,
        });
      }
    }).clone();
  }
};
module.exports = { getTime, updateTime };
