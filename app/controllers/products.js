const { Producto } = require("../models/product");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const { SQSClient, SendMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"; // Supports ESM


const WooCommerce = new WooCommerceRestApi({
  url: 'https://pruebas.toyoxpress.com/',
  consumerKey: 'ck_252527c6a32ea50bbd68947d7f315eab83475a70',
  consumerSecret: 'cs_8d2c05c03fa99e107891eae7348b31ae36fdb395',
  version: 'wc/v3',
  queryStringAuth: true // Force Basic Authentication as query string true and using under HTTPS
})

const client = new SQSClient({ region: "us-east-2",   credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }}); 


let arrayChunked = []
let arrayComprobatorio = []



const splitArrayIntoChunks = (array, chunkSize) => {
      const result = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
      }
      return result;
    };

const makeProducts = async (req, res) => {
  try {
    const {body} = req
    const {data, length} = body
    if (data) {

    let arrayBueno = data.map(producto => {
      return {  
        name: producto["Nombre Corto"],
        sku: producto.Código,
        price: producto["Precio Mayor"],
        regular_price: producto["Precio Mayor"],
        sale_price: producto["Precio Oferta"],
        manage_stock: true,
        status: "publish",
        stock_quantity: producto["Existencia Actual"],
        attributes: [{
          id: 1,
          name: "Marca",
          position: 0,
          visible: true,
          variation: false,
          options: [producto.Marca]
  }],
  meta_data: [{ key: 'cliente 2 price', value: producto.precio2 },
      {
    key: 'festiUserRolePrices',
    value: `{"cliente2":"${producto.precio2}","salePrice":{"cliente2":""},"schedule":{"cliente2":{"date_from":"","date_to":""}}}`
  }
  ],
}
    })
    const skus = data.map(producto => producto.Código);
    arrayChunked = splitArrayIntoChunks(skus, 50)
 Producto.deleteMany({}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log(
        "Todos los documentos de la colección de productos han sido eliminados."
      );
    }
  });
 Producto.insertMany(arrayBueno);

  const params = {
    QueueUrl: "https://sqs.us-east-2.amazonaws.com/872515257475/Toyoxpress.fifo",
    MessageBody: JSON.stringify({arr: arrayChunked[0], index: 0, maximo: length}),
    MessageGroupId: "grupo-1",
    MessageDeduplicationId: `0`, 
  };
  const command = new SendMessageCommand(params);
  try {
    const data = await client.send(command);
     console.log("Mensaje enviado: ", 0)
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
  }



    res.status(200).send({ message: "Excel Actualizado con éxito!" });
} else {
  res.status(400).send({ message: "Error al actualizar el Excel" });
}
    } catch (error) {
    console.error(error)
    sendError()
    throw error;
  }

}

const assingProducts = async (req, res) => {
try {
const {body} = req
const crear = [];
const actualizar = [];

for (const product of body.arr) {

  console.log(product.exists);
  
  if (product.exists == true) {
    const producto = await WooCommerce.get(`products?sku=${product.sku}`)
    let productoBD = await Producto.findOne({ sku: product.sku });
    let productoLimpio = productoBD.toObject();
    let {_id, ...productoNuevo} = productoLimpio
    productoNuevo.id = producto.data[0].id
    productoNuevo.featured = producto.data[0].featured
    console.log(productoNuevo)
    actualizar.push(productoNuevo);
  } else {
    const producto = await Producto.findOne({ sku: product.sku });
    console.log(product);
    crear.push(producto);
  }
}

const data = {
  create: crear,
  update: actualizar,
};

  let creacion = await WooCommerce.post("products/batch", data)




  // Parámetros para eliminar el mensaje en SQS
 const deleteParams = {
    QueueUrl: 'https://sqs.us-east-2.amazonaws.com/872515257475/Toyoxpress.fifo',
    ReceiptHandle: body.receiptHandle
  };

  // Comando para eliminar el mensaje
  const deleteCommand = new DeleteMessageCommand(deleteParams);
  
  // Envío del comando para eliminar el mensaje en SQS
  await client.send(deleteCommand);
  console.log("Mensaje eliminado de SQS");
  
  if (arrayChunked.length > body.index + 1 ) {
    const params = {
      QueueUrl: "https://sqs.us-east-2.amazonaws.com/872515257475/Toyoxpress.fifo",
      MessageBody: JSON.stringify({arr: arrayChunked[body.index+1], index: body.index+1, maximo: body.maximo}),
      MessageGroupId: "grupo-1",
      MessageDeduplicationId: `${body.index+1}`, 
    };
    const command = new SendMessageCommand(params);
    try {
      const data = await client.send(command);
      console.log("Mensaje enviado: ", body.index+1)
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  }
  res.status(200).send({ message: "Datos Actualizados con exito!" });
  global.shared.sendToClients(JSON.stringify({ index: body.index+1, maximo: body.maximo}));
} catch (error) {
console.log(error);
}
}

module.exports = {
  makeProducts,
  assingProducts
}
