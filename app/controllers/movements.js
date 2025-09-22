const { Ingreso, Egreso, Movimiento } = require("../models/movimiento");
const { DateTime } = require("luxon");
const { formatDateHoy } = require("../helpers/dates/dates");
const { FechaMonto } = require("../models/dias");
const ZONA_LOCAL = "America/Caracas"; // <- Venezuela

function fechaUnDiaAntes(fecha) {
    // Clonamos la fecha para no modificar la original
    const fechaClonada = new Date(fecha);
    // Restamos un día a la fecha clonada
    fechaClonada.setDate(fechaClonada.getDate() - 1);
    return fechaClonada;
}

const manejarFechas = async (fecha, parametros) => {
  let exist = await FechaMonto.findOne({fecha})
  let monto = parseFloat(parametros.monto);
  if (parametros.id.startsWith("E")){
    monto *= -1
  }

  if (exist) {
  exist.cuentas[parametros.cuenta] ?  exist.cuentas[parametros.cuenta] += monto :  exist.cuentas[parametros.cuenta] = monto
  Object.entries(parametros.pago).forEach(([key, value]) => {
      if (parametros.id.startsWith("E")) {
          value *= -1;
        }
    exist.pay_type[key] += parseFloat(value)
  })
  exist.usuarios[parametros.usuario] ?   exist.usuarios[parametros.usuario]  += monto : exist.usuarios[parametros.usuario] = monto

if (parametros.cuenta == "CajaChica") {
  exist.cajaChica += monto
} else {
  exist.monto += monto
}
await FechaMonto.findOneAndUpdate({fecha}, exist) 
} else {
      // Si la fecha no existe, obtener datos de la fecha anterior
      let fechaAnterior = fechaUnDiaAntes(fecha);
      let fechaAnteriorData = await FechaMonto.find({})
      .sort({ fecha: -1 }) // Ordena los resultados por fecha descendente
      .where('fecha').lte(fechaAnterior) // Filtra fechas menores o iguales que la fecha específica
      .limit(1);

      
      let nuevaFecha = {
        fecha,
        cuentas: {},
        usuarios: {},
        monto: 0,
        cajaChica: 0,
        pay_type: {}
      };

      // Si hay datos de la fecha anterior, copiarlos a la nueva fecha
      if (fechaAnteriorData[0]) {
        nuevaFecha.cuentas = { ...fechaAnteriorData[0].cuentas };
        nuevaFecha.usuarios = { ...fechaAnteriorData[0].usuarios };
        nuevaFecha.monto = fechaAnteriorData[0].monto;
        nuevaFecha.cajaChica = fechaAnteriorData[0].cajaChica;
        nuevaFecha.pay_type = { ...fechaAnteriorData[0].pay_type };
      }

      // Actualizar valores con los parámetros nuevos
      nuevaFecha.cuentas[parametros.cuenta] = (nuevaFecha.cuentas[parametros.cuenta] || 0) + monto;
      nuevaFecha.usuarios[parametros.usuario] = (nuevaFecha.usuarios[parametros.usuario] || 0) + monto;

      for (let [key, value] of Object.entries(parametros.pago)) {
        if (parametros.id.startsWith("E")) {
          value *= -1;
        }

        nuevaFecha.pay_type[key] = (nuevaFecha.pay_type[key] || 0) + parseFloat(value);
      }

      if (parametros.cuenta == "CajaChica") {
        nuevaFecha.cajaChica += monto;
      } else {
        nuevaFecha.monto += monto;
      }

      await FechaMonto.create(nuevaFecha);
    }
}


function formatearFecha(fecha) {
    // Dividir la fecha en día, mes y año
    let partes = fecha.split('/');
    const fechaISO8601 = `${partes[2]}-${partes[1]}-${partes[0]}T00:00:00.000Z`;
      let nuevaFecha = new Date(fechaISO8601);
    
    return nuevaFecha;
}

const crearMovimiento = async (req, res) => {
  // try {
  // let moves = await Movimiento.find({fecha: {$gte: '2023-09-29T00:00:00.000+00:00'}})
  // for (let move of moves) {
  //       await manejarFechas(move.fecha, {
  //           id: move.identificador,
  //           cuenta: move.cuenta,
  //           pago: {
  //               efectivo: move.efectivo,
  //               zelle: move.zelle,
  //               dollars: move.dollars,
  //               otro: move.otro
  //           },
  //           usuario: move.name,
  //           monto: move.monto
  //       });
  //   }
  // } catch (error) {
  // console.log(error)
  // }
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
  let fecha = formatearFecha(body.fecha);
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

  manejarFechas(fecha, {id:identificador, cuenta, pago: {
    efectivo: body.efectivo ? body.efectivo : 0,
    zelle: body.zelle ? body.zelle : 0,
    dollars: body.dollars?  body.dollars : 0,
    otro: body.otro ? body.otro : 0
  }, usuario: name, monto})

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

  res.status(200).send({ status: 200 });
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
  const fecha = formatearFecha(body.fecha);

  if (cuenta == "CajaChica") {
    pase = "si entre en caja chica";
    vale = identificador;
    aFecha = fecha;
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
        vale: vale,
        monto: monto,
        fecha: fecha,
      },
      { new: true }
    );
  } else {
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
  }
  res.status(200).send({ status: 200 });
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

// Define una función para realizar la conversión de fechas
const convertirFechas = async () => {
  try {
    // Realiza la consulta de agregación para convertir las fechas
    const resultados = await Movimiento.aggregate([
      {
        $set: {
          partesFecha: { $split: ["$fecha", "/"] } // Divide la cadena de fecha en partes usando "/"
        }
      },
      {
        $set: {
          fechaISO8601: {
            $concat: [
              { $arrayElemAt: ["$partesFecha", 2] }, "-", // Año
              { $arrayElemAt: ["$partesFecha", 0] }, "-", // Mes
              { $arrayElemAt: ["$partesFecha", 1] }, // Día
              "T00:00:00.000Z"
            ]
          }
        }
      },
      {
        $set: {
          fechaISO8601: { $toDate: "$fechaISO8601" } // Convertir la cadena a tipo Date
        }
      },
      {
        $unset: "partesFecha" // Eliminar el campo auxiliar partesFecha
      }
    ]).exec();


    //Prepara los objetos de actualización
    const operaciones = resultados.map(resultado => ({
      updateOne: {
        filter: { _id: resultado._id }, // Filtra por el ID del documento
        update: resultado // Usa el resultado de la conversión como datos de actualización
      }
    }));

    // Ejecuta la operación de escritura masiva para reemplazar los datos
    await Movimiento.bulkWrite(operaciones);

    console.log("Datos actualizados correctamente.");
  } catch (error) {
    console.error("Error al actualizar los datos:", error);
  }
};


const sumarRestarMontos = async (finalCondition, inicio, final) => {
  try {
    let matchStage
    // Construir la etapa de coincidencia (match) para aplicar las condiciones
    if (inicio && final) {
      matchStage = { $match: {
             fecha: {
                 $gte: new Date (inicio), // Filtrar fechas que sean mayores o iguales a startDate
                 $lte: new Date (final)    // Filtrar fechas que sean menores o iguales a endDate
             }, 
             ...finalCondition
         }, };
    } else {
            matchStage = { $match: {
             ...finalCondition
         }, };
    }

    // Construir la etapa de proyecto (project) para extraer solo las claves que necesitamos (identificador y monto)
    const projectStage = {
      $project: {
        _id: 0,
        identificador: 1,
        monto: 1,
        cuenta: 1,
      }
    };

    // Construir la etapa de agregación condicional para sumar o restar montos según el identificador
const groupStage = {
  $group: {
    _id: null,
    total: {
      $sum: {
        $cond: [
          { $eq: [{ $substr: ["$identificador", 0, 1] }, "I"] }, // Si el identificador comienza con "I"
          { $cond: [
            { $eq: ["$cuenta", "CajaChica"] }, // Si la cuenta es "CajaChica"
            0, // No contar en la suma del total
            {$toDouble: "$monto"} // Sumar el monto al total
          ]},
          { $cond: [
            { $eq: ["$cuenta", "CajaChica"] }, // Si la cuenta es "CajaChica"
            0, // No contar en la suma del total
          { $multiply: [{ $toDouble: "$monto" }, -1] }// Sumar el monto al total
          ]}
          // Restar el monto después de convertirlo a numérico
        ]
      }
    },
    cajaChica: {
      $sum: {
        $cond: [
          { $eq: [{ $substr: ["$identificador", 0, 1] }, "I"] }, // Si el identificador comienza con "I"
          { $cond: [
            { $eq: ["$cuenta", "CajaChica"] }, // Si la cuenta es "CajaChica"
            {$toDouble: "$monto"}, // No contar en la suma del total
              0// Sumar el monto al total
          ]},
          { $cond: [
            { $eq: ["$cuenta", "CajaChica"] }, // Si la cuenta es "CajaChica"
          { $multiply: [{ $toDouble: "$monto" }, -1] }, // No contar en la suma del total
           0// Sumar el monto al total
          ]}
          // Restar el monto después de convertirlo a numérico
        ]
      }
}
  }
};
    // Ejecutar la agregación en la base de datos
    const resultado = await Movimiento.aggregate([matchStage, projectStage, groupStage]);
    let saldo = resultado.length > 0 ? resultado[0].total : 0
    let cajaChica = resultado.length > 0 ? resultado[0].cajaChica : 0
    // El resultado contendrá un solo documento con el total de la operación
    return {saldo, cajaChica}
  } catch (error) {
    console.error("Error al realizar la operación de suma/resta:", error);
    throw error;
  }
};


const generarPDFData = async (condition, fechas, conditionSaldo) => {
 let conditionWithArrays = {};
  let conditionSaldoWithArrays = {};


  // Convertimos la condición para que cualquier valor que sea un string o número se convierta en un array con un solo elemento
  if (condition) {
    conditionWithArrays = Object.entries(condition).reduce((acc, [key, value]) => {
    if (Array.isArray(value) && key !== "pago") {
      acc[key] = { $in: value }; // Utilizar $in si el valor es un array
    } else if (key !== "status")  {
      acc[key] = value; // Mantener el valor tal como está si no es un array
    }
    return acc;
    }, {});
  }

if (conditionSaldo) {
  conditionSaldoWithArrays = Object.entries(conditionSaldo).reduce((acc, [key, value]) => {
    if (Array.isArray(value) && key !== "pago") {

      acc[key] = { $in: value }; // Utilizar $in si el valor es un array
    } else if (key !== "status" && key !== "pago") {
      acc[key] = value; // Mantener el valor tal como está si no es un array
    }
    return acc;
  }, {});
}
const preInicio = DateTime.fromISO('2023-01-01').startOf("day").toUTC();
  const inicio = DateTime.fromISO(fechas.from).startOf("day").toUTC();
  const final = DateTime.fromISO(fechas.to).endOf("day").toUTC();
  const fecha = { $gte: inicio.toISO(), $lte: final.toISO() };
 let vales


  const finalConditionSaldo = {
    ...conditionSaldoWithArrays,
    disabled: false,
  }
  const finalCondition = {
    ...conditionSaldoWithArrays,
    ...vales,
    disabled: false,
    fecha
  };


  const movimientos = await Movimiento.find(finalCondition)
    .sort({ _id: 1 })
    .lean()
    .exec();



// Realizacion cambio de movimientos a documento fecha
let fechaInicio = await sumarRestarMontos(finalConditionSaldo, preInicio.toISO(), inicio.toISO());
fechaInicio.total = fechaInicio.saldo + fechaInicio.cajaChica
let fechaFin = await sumarRestarMontos(finalConditionSaldo, preInicio.toISO(), final.toISO());
fechaFin.total = fechaFin.saldo + fechaFin.cajaChica

  return {movimientos, fechaInicio, fechaFin}
}



const getMoves = async (condition, page, cantidad, fechas, conditionSaldo, sort, vm, nm) => {
  let conditionWithArrays = {};
  let conditionSaldoWithArrays = {};

  // Normaliza condition
  if (condition) {
    conditionWithArrays = Object.entries(condition).reduce((acc, [key, value]) => {
      if (Array.isArray(value) && key !== "pago") {
        acc[key] = { $in: value };
      } else if (key !== "status") {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  // Normaliza conditionSaldo
  if (conditionSaldo) {
    conditionSaldoWithArrays = Object.entries(conditionSaldo).reduce((acc, [key, value]) => {
      if (Array.isArray(value) && key !== "pago") {
        acc[key] = { $in: value };
      } else if (key !== "status" && key !== "pago") {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  // Condiciones adicionales por "pago"
  let aditionalCondition = {};
  let aditionalConditionSaldo = {};

  if (condition && condition.pago) {
    aditionalCondition = {
      $and: condition.pago.map((item) => ({ [item]: { $gt: 1 } })),
    };
  }

  if (conditionSaldo && conditionSaldo.pago) {
    aditionalConditionSaldo = {
      $and: conditionSaldo.pago.map((item) => ({ [item]: { $gt: 1 } })),
    };
  }

  // Filtro por nombre si vm === false
  if (vm === false) {
    conditionWithArrays.name = nm;
  }

  // =============================
  // RANGO DE FECHAS (OPCIÓN B - UTC PURO)
  // Interpreta from/to como días calendario en UTC
  // [startUTC (incl), endExclusiveUTC (excl)]
  // =============================
  const startUTC = DateTime
    .fromJSDate(new Date(fechas.from))
    .toUTC()
    .startOf("day")
    .toJSDate();

  const endExclusiveUTC = DateTime
    .fromJSDate(new Date(fechas.to))
    .toUTC()
    .plus({ days: 1 })
    .startOf("day")
    .toJSDate();

  const fecha = { $gte: startUTC, $lt: endExclusiveUTC };

  // Filtro por status -> vale
  let vales;
  if (condition?.status === "Aprove") {
    vales = { vale: { $ne: "" } };
  } else if (condition?.status === "Unverified") {
    vales = { vale: "" };
  } else {
    vales = {};
  }

  const finalConditionSaldo = {
    ...conditionSaldoWithArrays,
    ...aditionalConditionSaldo,
    ...vales,
    disabled: false,
  };

  const finalCondition = {
    ...conditionWithArrays,
    ...aditionalCondition,
    ...vales,
    disabled: false,
    fecha, // <-- rango UTC [incl, excl]
  };

  // Mantengo tu ajuste de sort
  if (sort?.fecha) {
    sort = { ...sort, _id: sort.fecha };
  }

  const movimientos = await Movimiento.find(finalCondition)
    .sort(sort)
    .skip(page)
    .limit(parseInt(cantidad, 10))
    .lean()
    .exec();

  // Cálculo de saldos con la condición de saldo (sin rango de fecha, como ya lo tenías)
  const vuelta = await sumarRestarMontos(finalConditionSaldo);

  const total = await Movimiento.countDocuments(finalCondition);

  return { movimientos, total, ...vuelta };
};
module.exports = {
  crearMovimiento,
  getMoves,
  modificarStatus,
  deleteMoves,
  modificarMovimiento,
  generarPDFData
};
