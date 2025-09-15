const { ExcelProductos, ExcelClientes } = require("../models/excel");
const Fecha = require("../models/fecha");

function combinarArraysSinRepeticiones(array1, array2) {
  const codigosArray1 = array1.map((obj) => obj.Código);
  const codigosArray2 = array2.map((obj) => obj.Código);

  const codigosUnicos = new Set([...codigosArray1, ...codigosArray2]);

  const array3 = Array.from(codigosUnicos, (codigo) => {
    const elementoArray1 = array1.find((obj) => obj.Codigo === codigo);
    const elementoArray2 = array2.find((obj) => obj.Codigo === codigo);

    return elementoArray1 || elementoArray2;
  });

  return array3;
}

const updateExcelProductos = async (req, res) => {
  const { body } = req;
  const array1 = body;
  const array2 = await ExcelProductos.find({});

  ExcelProductos.deleteMany({}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log(
        "Todos los documentos de la colección de productos han sido eliminados."
      );
    }
  });
  ExcelProductos.insertMany(array1);

  if (!array1) {
    res.status(400).send({ message: "Ha ocurrido un error!" });
  } else {
    res.status(200).send({ message: "Excel Actualizado con éxito!" });
  }
};

const updateStock = async (code, cantidad) => {
  let eq = await ExcelProductos.findOne({ Código: code });
  console.log(eq["Existencia Actual"], cantidad);
  let stock =typeof eq["Existencia Actual"] == "string" ? parseInt(eq["Existencia Actual"]) - cantidad : eq["Existencia Actual"] - cantidad;

  await ExcelProductos.findOneAndUpdate(
    { Código: code },
    { "Existencia Actual": stock},
    { new: true }
  )
    .then((result) => {
      console.log("Stock actualizado:", result);
    })
    .catch((error) => {
      console.error("Error al actualizar el stock:", error);
    });
};

const fechaAct = async (req, res) => {
  try {
    const { body } = req;
    let arr = body;
    console.log(arr)

    

    // Inserta los nuevos documentos en la colección "Fecha"
    const fecha = await Fecha.insertMany(arr);
console.log("Fecha", fecha)
    console.log("Datos actualizados correctamente.");
    res.send({ fecha });
    global.shared.sendFecha("Fecha Cargada")
  } catch (error) {
    console.error("Error al actualizar los datos:", error);
    res.status(500).send(`Error al actualizar los datos ${error}`);
  }
};

const fechaget = async (req, res) => {
let fechas = await Fecha.find({})
  .sort({ _id: -1 }) // Ordenar por fecha de creación descendente (los más recientes primero)
  .limit(3);
  console.log(fechas) // Limitar el resultado a los 3 objetos más recientes
  res.send({ fechas });
};4

const getExcelClientes = async (condition, page) => {

let codigo = condition ? { Nombre: new RegExp(condition.Nombre, "i")} : {};
  const start = Date.now();
  let excel = await ExcelClientes.find(codigo)  
      .sort({ _id: -1 })
      .skip(page)
      .limit(parseInt(process.env.PAGINA))
      .lean()
      .exec();
    const total = await ExcelClientes.countDocuments(condition);
     const end = Date.now();
      console.log(`⏱️ Query ExcelClientes tardó: ${end - start} ms`);
  return { total, excel };
};

const updateExcelClientes = async (req, res) => {
  const { body } = req;
  const array1 = body;


  ExcelClientes.deleteMany({}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Todos los documentos de la colección han sido eliminados.");
    }
  });

  ExcelClientes.insertMany(array1);

  if (!array1) {
    res.status(400).send({ message: "Ha ocurrido un error!" });
  } else {
    res.status(200).send({ message: "Excel Actualizado con éxito!" });
  }
};

const escapeRegex = (s) => {
  if (!s) return "";          // null, undefined, vacío
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};


const getExcelProductos = async (codigoSearch, offset, limit) => {
  const filter = codigoSearch
    ? { Código: { $regex: `^${escapeRegex(codigoSearch["Código"])}`, $options: "i" } }
    : {};

    console.log(codigoSearch, offset, limit, filter)


  const [excel, total] = await Promise.all([
    ExcelProductos.find(filter)
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit)
      .lean()
      .exec(),
    ExcelProductos.countDocuments(filter),
  ]);

  return { total, excel };
};

const getCompleteExcelProductos = async (req, res) => {
  let excel = await ExcelProductos.find({});

  if (excel == []) {
    res.status(404).send({ existencia: false });
  } else {
    res.status(200).send({ existencia: "Lista de Clientes", excel });
  }
};

module.exports = {
  getExcelProductos,
  updateExcelProductos,
  updateExcelClientes,
  getExcelClientes,
  getCompleteExcelProductos,
  updateStock,
  fechaAct,
  fechaget,
};
