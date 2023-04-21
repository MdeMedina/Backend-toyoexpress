const { Ingreso, Egreso, Movimiento } = require("../models/movimiento");
const { DateTime } = require("luxon");
const { formatDateHoy } = require("../helpers/dates/dates");

const crearMovimiento = async (req, res) => {
  const { body } = req;
  const hoy = `${formatDateHoy(new Date())}`;
  const name = body.name;
  const isMove = await Movimiento.find({});

  let identificador;
  if (isMove.length < 9) {
    let par = isMove.length + 1;
    identificador = `${body.id}-00${par}`;
  } else if (isMove.length >= 9 && isMove.length < 99) {
    let par = isMove.length + 1;
    identificador = `${body.id}-0${par}`;
  } else if (isMove.length >= 99) {
    let par = isMove.length + 1;
    identificador = `${body.id}-${par}`;
  }

  const concepto = body.concepto;
  const monto = body.monto;
  const fecha = body.fecha;
  let aFecha = "";
  const cuenta = body.cuenta;
  let vale = "";
  let pase = "";
  if (cuenta == "CajaChica") {
    pase = "si entre en caja chica";
    vale = identificador;
    aFecha = fecha;
  }
  const move = await Movimiento.create({
    identificador: identificador,
    cuenta: cuenta,
    concepto: concepto,
    efectivo: body.efectivo,
    zelle: body.zelle,
    bs: body.bs,
    change: body.change,
    dollars: body.dollars,
    otro: body.otro,
    monto: monto,
    fecha: fecha,
    name: name,
    afecha: aFecha,
    email: body.email,
    vale: vale,
    messageId: body.messageId,
    disabled: false,
  });
  const movimientos = await Movimiento.find({});

  let moves = [];
  movimientos.map((n) => {
    moves.push(n);
  });
  res.status(201).send({
    message: "Movimiento creado con exito",
    move: {
      identificador: identificador,
      cuenta: cuenta,
      concepto: concepto,
      efectivo: body.efectivo,
      zelle: body.zelle,
      bs: body.bs,
      change: body.change,
      dollars: body.dollars,
      otro: body.otro,
      monto: monto,
      fecha: fecha,
      name: name,
      afecha: aFecha,
      email: body.email,
      vale: vale,
      messageId: body.messageId,
      disabled: false,
    },
    pase,
    vale,
    cuenta,
    moves,
    status: 200,
  });
};

const deleteMoves = async (req, res) => {
  const { body } = req;
  const filter = body.identificador;
  const move = await Movimiento.findOneAndUpdate(
    { identificador: filter },
    {
      disabled: true,
    },
    { new: true }
  );
  const movimientos = await Movimiento.find({});
  let moves = [];
  movimientos.map((n) => {
    moves.push(n);
  });
  res.status(200).send({ moves, status: 200 });
};

const modificarMovimiento = async (req, res) => {
  const { body } = req;
  const filter = body.identificador;
  let identificador = body.identificador;
  identificador = identificador.split("-")[1];
  let id = body.id;
  identificador = `${id}-${identificador}`;
  const concepto = body.concepto;
  const monto = body.monto;
  const cuenta = body.cuenta;
  const fecha = body.fecha;
  const move = await Movimiento.findOneAndUpdate(
    { identificador: filter },
    {
      identificador,
      cuenta: cuenta,
      concepto: concepto,
      efectivo: body.efectivo,
      zelle: body.zelle,
      bs: body.bs,
      change: body.change,
      dollars: body.dollars,
      otro: body.otro,
      monto: monto,
      fecha: fecha,
    },
    { new: true }
  );
  const movimientos = await Movimiento.find({});
  let moves = [];
  movimientos.map((n) => {
    moves.push(n);
  });
  res.status(200).send({ moves, status: 200 });
};

const modificarStatus = async (req, res) => {
  const { body } = req;
  const filter = body.identificador;

  const isVale = await Movimiento.findOne({ vale: body.vale });
  if (isVale && !isVale.disabled) {
    res.status(403).send("Este numero de aprobacion ya existe");
  } else {
    const move = await Movimiento.findOneAndUpdate(
      { identificador: filter },
      { vale: body.vale, aFecha: body.aFecha },
      { new: true }
    );
    res.status(200).send(move);
  }
};

const getMoves = async (req, res) => {
  const movimientos = await Movimiento.find({});
  let moves = [];
  movimientos.map((n) => {
    moves.push(n);
  });
  res.status(200).send(moves);
};
module.exports = {
  crearMovimiento,
  getMoves,
  modificarStatus,
  deleteMoves,
  modificarMovimiento,
};
