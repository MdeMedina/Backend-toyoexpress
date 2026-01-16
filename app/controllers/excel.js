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
  let codigo = condition ? { Nombre: new RegExp(condition.Nombre, "i") } : {};

  const start = Date.now();

  console.time("mongo:find(ExcelClientes)");
  let excel = await ExcelClientes.find(codigo)
    .sort({ _id: -1 })
    .skip(page)
    .limit(parseInt(process.env.PAGINA))
    .lean()
    .exec();
  console.timeEnd("mongo:find(ExcelClientes)");

  console.time("mongo:count(ExcelClientes)");
  const total = await ExcelClientes.countDocuments(condition);
  console.timeEnd("mongo:count(ExcelClientes)");

  const end = Date.now();
  console.log(`⏱️ Query ExcelClientes TOTAL: ${end - start} ms`);

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
  if (!s) return "";
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const buildCodigoFilter = (termRaw) => {
  const q = termRaw ? String(termRaw).trim() : "";
  if (!q) return {};

  // Optimización: Si el término no tiene caracteres especiales regex y es corto,
  // usar búsqueda por prefijo (más eficiente con índices)
  const escapedQ = escapeRegex(q);
  
  // Para búsquedas por prefijo (comienzan desde el inicio), usar $regex con ^
  // Esto permite que MongoDB use el índice de manera más eficiente
  // El índice en Código ayudará a optimizar esta búsqueda
  return { Código: { $regex: `^${escapedQ}`, $options: "i" } };
};

const getExcelProductos = async (codigoSearch, offset, limit) => {
  console.time("⏱️ getExcelProductos total");
  
  const term = typeof codigoSearch === "object" ? codigoSearch?.["Código"] : codigoSearch;
  const filter = buildCodigoFilter(term);
  
  console.log("🔍 Filter usado:", JSON.stringify(filter));

  // Query de datos con timeout y optimizaciones
  console.time("📊 find() - await");
  const excel = await ExcelProductos.find(filter)
    .sort({ _id: -1 })
    .skip(offset || 0)
    .limit(limit || 20)
    .lean()
    .maxTimeMS(5000); // Timeout de 5 segundos para la consulta
  console.timeEnd("📊 find() - await");
  
  console.log(`📦 find() devolvió ${excel.length} documentos`);

  // Count solo cuando es necesario (primera página o cuando se solicita explícitamente)
  // Usar estimatedDocumentCount para queries vacías (más rápido)
  let total = null;
  if (offset === 0 && Object.keys(filter).length > 0) {
    console.time("📈 countDocuments() - await");
    try {
      total = await ExcelProductos.countDocuments(filter).maxTimeMS(3000);
      console.timeEnd("📈 countDocuments() - await");
      console.log(`📊 Total en DB: ${total}`);
    } catch (error) {
      console.warn("⚠️ Error en countDocuments (usando length como fallback):", error.message);
      total = excel.length; // Fallback si countDocuments falla
    }
  } else if (offset === 0 && Object.keys(filter).length === 0) {
    // Para queries sin filtro, usar estimatedDocumentCount (más rápido)
    try {
      total = await ExcelProductos.estimatedDocumentCount().maxTimeMS(2000);
      console.log(`📊 Total estimado en DB: ${total}`);
    } catch (error) {
      console.warn("⚠️ Error en estimatedDocumentCount:", error.message);
    }
  }

  console.timeEnd("⏱️ getExcelProductos total");

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
