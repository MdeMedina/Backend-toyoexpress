const dataPDF = require("../models/dataPDF");


const crearPDF = async (cliente, vendedor,  products, correlativo, total) => {
  try {
    let pdf = await dataPDF.create({
      cor: correlativo,
      cliente: cliente.Nombre,
      vendedor,
      fecha: Date.now(),
      productos: products,
      total
    });

    console.log("datPDF creado", pdf);
  } catch (e) {
   console.log("Error al crear el PDF", e);
  }
};



const getPDF = async (req, res) => {
  const { body } = req;
  console.log(body)
  const skip = (body.page - 1) * 10;
  let totalPDF = 0;
  let PDFS = [];
  let data = await dataPDF.findOne({}, null, { sort: { cor: -1 } });
  data.cor = data.cor + 1;
  if (body.registro) {
    const query = {};

if (body.cor) {
  query.cor = body.cor;
}

if (body.cliente) {
  query.cliente = { $regex: body.cliente, $options: 'i' };
}

if (body.vendedor) {
  query.vendedor = { $regex: body.vendedor, $options: 'i' };
}


    totalPDF = await dataPDF.countDocuments(query);
      
      PDFS = await dataPDF.find(query).limit(10).sort({ cor: -1 }).skip(skip);  
  }



if (!PDFS[0] && !data) {
  res.status(404).send("No existen pdf!");
} else if (PDFS[0]) {
  res.status(200).send({PDFS, total: totalPDF});
} else {
  res.status(200).send({data});
}};

module.exports = { getPDF, crearPDF };
