const { Ingreso, Egreso } = require("../models/movimiento");
const { DateTime } = require("luxon");
const { formatDateHoy} = require("../helpers/dates/dates");

const crearIngreso = async (req, res) => {
  const { body } = req;
  const hoy = `${formatDateHoy(new Date())}`;
  const name = body.name;
  const isMove = await Ingreso.find({});

  let identificador;
  if (isMove.length < 10) {
    let par = isMove.length + 1;
    identificador = `I-00${par}`;
  } else if (isMove.length >= 10 && isMove.length < 100) {
    let par = isMove.length + 1;
    identificador = `I-0${par}`;
  } else if (isMove.length >= 100) {
    let par = isMove.length + 1;
    identificador = `I-${par}`;
  }

  const concepto = body.concepto;
  const monto = body.monto;
  const fecha = body.fecha;
  const cuenta = body.cuenta;
  const pago = body.pago;
  const move = Ingreso.create({
    identificador: identificador,
    cuenta: cuenta,
    concepto: concepto,
    bs: body.bs,
    change: body.change,
    monto: monto,
    fecha: fecha,
    name: name,
    pago: pago,
    afecha: "",
    email: body.email,
    vale: "",
    messageId: body.messageId,
    disabled: false
  });
  res.status(201).send("Ingreso enviado con exito");
};

const crearEgreso = async (req, res) => {
  const { body } = req;


  const isMove = await Egreso.find({});
  const name = body.name;
  let identificador;
  if (isMove.length < 9) {
    let par = isMove.length + 1;
    identificador = `E-00${par}`;
  } else if (isMove.length >= 10 && isMove.length < 100) {
    let par = isMove.length + 1;
    identificador = `E-0${par}`;
  } else if (isMove.length >= 100) {
    let par = isMove.length + 1;
    identificador = `E-${par}`;
  }

  const concepto = body.concepto;
  const monto = body.monto;
  const cuenta = body.cuenta;
  const pago = body.pago;
  const fecha = body.fecha;
  const move = Egreso.create({
    identificador: identificador,
    cuenta: cuenta,
    concepto: concepto,
    bs: body.bs,
    change: body.change,
    monto: monto,
    fecha: fecha,
    name: name,
    pago: pago,
    vale: "",
    afecha: "",
    email: body.email,
    messageId: body.messageId,
    disabled: false
  });
  res.status(201).send("Egreso enviado con exito");
};

const deleteMoves = async (req, res) => {
  const { body } = req;
  const filter = body.identificador;
  if (body.identificador.charAt(0) == "E") {
    const move = await Egreso.findOneAndUpdate(
      { identificador: filter },
      {
        disabled: true
      },
      { new: true }
    );
    res.status(200).send(move);
  } else if (body.identificador.charAt(0) == "I") {
    const move = await Ingreso.findOneAndUpdate(
      { identificador: filter },
      {
        disabled: true
      },
      { new: true }
    );
    res.status(200).send(move);
  }
};


const modificarMovimiento = async (req, res) => {
  const { body } = req;
  const filter = body.identificador;
  const concepto = body.concepto;
  const monto = body.monto;
  const cuenta = body.cuenta;
  const pago = body.pago;
  const fecha = body.fecha;
  if (body.identificador.charAt(0) == "E") {
    const move = await Egreso.findOneAndUpdate(
      { identificador: filter },
      {
        cuenta: cuenta,
        concepto: concepto,
        bs: body.bs,
        change: body.change,
        monto: monto,
        fecha: fecha,
        pago: pago,
      },
      { new: true }
    );
    res.status(200).send(move);
  } else if (body.identificador.charAt(0) == "I") {
    const move = await Ingreso.findOneAndUpdate(
      { identificador: filter },
      {
        cuenta: cuenta,
        concepto: concepto,
        bs: body.bs,
        change: body.change,
        monto: monto,
        fecha: fecha,
        pago: pago,
      },
      { new: true }
    );
    res.status(200).send(move);
  }
};

const modificarStatus = async (req, res) => {

  const { body } = req;
  const filter = body.identificador;
  if (body.identificador.charAt(0) == "E") {
    const isValeE = await Egreso.findOne({ vale: body.vale });
    const isValeI = await Ingreso.findOne({ vale: body.vale });
    if (isValeI || isValeE) {
      res.status(403).send("Este numero de aprobacion ya existe");
    } else {
      const move = await Egreso.findOneAndUpdate(
        { identificador: filter },
        { vale: body.vale, aFecha: body.aFecha },
        { new: true }
      );
      res.status(200).send(move);
    }
  } else if (body.identificador.charAt(0) == "I") {
    const isValeI = await Ingreso.findOne({ vale: body.vale });
    const isValeE = await Egreso.findOne({ vale: body.vale });
    if (isValeI || isValeE) {
      res.status(403).send("Este numero de aprobacion ya existe");
    } else {
      const move = await Ingreso.findOneAndUpdate(
        { identificador: filter },
        { vale: body.vale, aFecha: body.aFecha },
        { new: true }
      );
      res.status(200).send(move);
    }
  }
};

const getMoves = async (req, res) => {
  const egresos = await Egreso.find({});
  const ingresos = await Ingreso.find({});
  let moves = [];
  egresos.map((n) => {
    moves.push(n);
  });
  ingresos.map((n) => {
    moves.push(n);
  });
  res.status(200).send(moves);
};
module.exports = {
  crearIngreso,
  crearEgreso,
  getMoves,
  modificarStatus,
  deleteMoves,
  modificarMovimiento,
};
