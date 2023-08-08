const { ExcelProductos, ExcelClientes } = require("../models/excel");

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
      console.log("Todos los documentos de la colección han sido eliminados.");
    }
  });

  ExcelProductos.insertMany(array1);

  if (!array1) {
    res.status(400).send({ message: "Ha ocurrido un error!" });
  } else {
    res.status(200).send({ message: "Excel Actualizado con éxito!" });
  }
};

const getExcelClientes = async (req, res) => {
  const { body } = req;
  console.log(body);
  let excel = await ExcelClientes.find({
    Nombre: new RegExp(body.Nombre, "i"),
  });

  if (excel == []) {
    res.status(404).send({ existencia: false });
  } else {
    res.status(200).send({ existencia: "Lista de Clientes", excel });
  }
};

const updateExcelClientes = async (req, res) => {
  const { body } = req;
  const array1 = body;
  const array2 = await ExcelClientes.find({});

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

const getExcelProductos = async (req, res) => {
  const { body } = req;
  console.log(body);
  let excel = await ExcelProductos.find({
    Código: new RegExp(body.Código, "i"),
  });

  if (excel == []) {
    res.status(404).send({ existencia: false });
  } else {
    res.status(200).send({ existencia: "Lista de Clientes", excel });
  }
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
};
