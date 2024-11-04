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

const updateStock = async (req, res) => {
  const { body } = req;
  let eq = await ExcelProductos.findOne({ Código: body.codigo });
  console.log(eq["Existencia Actual"], body.stock);
  let stock = eq["Existencia Actual"] - body.stock;

  await ExcelProductos.findOneAndUpdate(
    { Código: body.codigo },
    { "Existencia Actual": stock },
    { new: true }
  ).then((updateProduct) => {
    res.status(200).send({ message: "Excel Actualizado con éxito!" });
  });
};

const fechaAct = async (req, res) => {
  try {
    const { body } = req;
    let arr = body;
    console.log(arr)

    

    // Inserta los nuevos documentos en la colección "Fecha"
    const fecha = await Fecha.insertMany(arr);

    console.log("Datos actualizados correctamente.");
    res.send({ fecha });
  } catch (error) {
    console.error("Error al actualizar los datos:", error);
    res.status(500).send("Error al actualizar los datos");
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
  let excel = await ExcelClientes.find(codigo)  
      .sort({ _id: -1 })
      .skip(page)
      .limit(parseInt(process.env.PAGINA))
      .lean()
      .exec();
    const total = await ExcelClientes.countDocuments(condition);
  return { total, excel, };
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

const getExcelProductos = async (condition, page) => {
let codigo = condition ? { Código: new RegExp(condition.Código, "i")} : {};
  let excel = await ExcelProductos.find(codigo)  
      .sort({ _id: -1 })
      .skip(page)
      .limit(parseInt(process.env.PAGINA))
      .lean()
      .exec();
    const total = await ExcelProductos.countDocuments(condition);
  return { total, excel, };
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
