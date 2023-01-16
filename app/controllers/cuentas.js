const Cuenta = require("../models/date");

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
  const act = await User.findOneAndUpdate(
    { _id: body._id },
    {
      name: body.name,
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
    const isAccount = await Cuenta.findOne({ email: body.email });
    if (isAccount) {
      return res.status(403).send("usuario ya existe");
    }
    const account = await Cuenta.create({
      name: body.name,
      color: body.color,
    });
    res.status(201).send(account);
  } catch (e) {
    httpError(res, e);
  }
};

module.exports = { getCuentas, actCuenta, crearCuenta };
