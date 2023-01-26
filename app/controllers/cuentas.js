const Cuenta = require("../models/cuenta");
const { httpError } = require("../helpers/handleError");

const getCuentas = async (req, res) => {
  let cuentas = await Cuenta.find({});
  if (!cuentas) {
    res.status(404).send("porfavor cree algunas cuentas!");
  } else {
    res.status(200).send(cuentas);
  }
};

const actCuenta = async (req, res) => {
  const { body } = req;
  const act = await Cuenta.findOneAndUpdate(
    { _id: body._id },
    {
      label: body.name,
      value: body.name,
      color: body.color,
    }
  );
  if (!act) {
    res.status(400).send("Ha ocurrido un error!");
  } else {
    res.status(200).send("Cuenta actualizada con exito");
  }
};

const crearCuenta = async (req, res) => {
  const { body } = req;
  try {
    const isAccount = await Cuenta.findOne({ label: body.name });
    if (isAccount) {
      console.log(isAccount)
      res.status(403).send("Esa cuenta existe");
    } else {
      const account = await Cuenta.create({
        label: body.name,
        value: body.name,
        color: body.color,
      });
      res.status(201).send(account);
    }
  } catch (e) {
    httpError(res, e);
  }
};

const deleteCuentas = async (req, res) => {
  const { body } = req;
  console.log(body)
  const del = await Cuenta.findOneAndRemove({ _id: body._id });
  console.log(del)
  res.status(200).send(del);
};

module.exports = { getCuentas, actCuenta, crearCuenta, deleteCuentas };
