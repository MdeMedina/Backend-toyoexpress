const { ExcelProductos, ExcelClientes } = require("../models/excel");
const updateExcelProductos = async (req, res) => {
  const { body } = req;
  const array1 = body;
  const array2 = await ExcelProductos.find({});

  const map2 = array2.reduce((acc, obj) => {
    acc[obj.Código] = obj;
    return acc;
  }, {});

  const newArray1 = array1.reduce((acc, obj1) => {
    if (map2[obj1.Código]) {
      acc.push({ ...obj1, ...map2[obj1.Código] });
      delete map2[obj1.Código];
    } else {
      acc.push(obj1);
    }
    return acc;
  }, []);

  const remainingObjects = Object.values(map2);
  const finalArray = newArray1.concat(remainingObjects);

  Excel.deleteMany({}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Todos los documentos de la colección han sido eliminados.");
    }
  });

  Excel.insertMany(finalArray);

  if (!finalArray) {
    res.status(400).send({ message: "Ha ocurrido un error!" });
  } else {
    res.status(200).send({ message: "Excel Actualizado con éxito!" });
  }
};

const getExcelClientes = async (req, res) => {
  let excel = await ExcelClientes.find({});
  if (excel == []) {
    res.status(404).send({ existencia: false });
  } else {
    res.status(200).send({ existencia: "Lista de productos", excel });
  }
};

const updateExcelClientes = async (req, res) => {
  const { body } = req;
  const array1 = body;
  const array2 = await ExcelClientes.find({});

  const map2 = array2.reduce((acc, obj) => {
    acc[obj.Código] = obj;
    return acc;
  }, {});

  const newArray1 = array1.reduce((acc, obj1) => {
    if (map2[obj1.Código]) {
      acc.push({ ...obj1, ...map2[obj1.Código] });
      delete map2[obj1.Código];
    } else {
      acc.push(obj1);
    }
    return acc;
  }, []);

  const remainingObjects = Object.values(map2);
  const finalArray = newArray1.concat(remainingObjects);

  Excel.deleteMany({}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("Todos los documentos de la colección han sido eliminados.");
    }
  });

  Excel.insertMany(finalArray);

  if (!finalArray) {
    res.status(400).send({ message: "Ha ocurrido un error!" });
  } else {
    res.status(200).send({ message: "Excel Actualizado con éxito!" });
  }
};

const getExcelProductos = async (req, res) => {
  let excel = await Excel.find({});
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
};
