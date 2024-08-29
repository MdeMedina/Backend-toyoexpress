const { Producto } = require("../models/product");
const { clients } = require('../../index')
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


  function sendSSEToClients(message) {
  clients.forEach(client => client.write(`data: ${JSON.stringify(message)}\n\n`));
}




function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

const makeProducts = async (req, res) => {
  try {
    const {body} = req
    console.log(body)
    let arrayBueno = body.map(producto => {
      return {  
        name: producto["Nombre Corto"],
        sku: producto.Código,
        price: producto["Precio Mayor"],
        regular_price: producto["Precio Mayor"],
        sale_price: producto["Precio Oferta"],
        manage_stock: true,
        status: "pending",
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
    const skus = body.map(producto => producto.Código);

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

skus.forEach(async (sku, index) => {
  console.log("sku: ", sku, " - Index: ", index);
  const params = {
    QueueUrl: "https://sqs.us-east-2.amazonaws.com/872515257475/Toyoxpress",
    MessageBody: JSON.stringify({sku, index, longitud: skus.length}),
  };
  const command = new SendMessageCommand(params);
  console.log("Command: ", command);
  try {
    const data = await client.send(command);
    console.log("Mensaje enviado con éxito:", data);
  } catch (error) {
    console.error("Error al enviar el mensaje:", error);
  }
});


    res.status(200).send({ message: "Excel Actualizado con éxito!" });
  
    } catch (error) {
    console.error(error)
    throw error;
  }

}

const assingProducts = async (req, res) => {
try {
const {body} = req
const producto = await Producto.findOne({sku: body.sku})
console.log("Producto", producto)
if (body.exists) {
 // Actualización del producto en WooCommerce
  const response = await WooCommerce.put(`products/${body.id}`, producto);
  console.log("Respuesta PUT", response);

  // Parámetros para eliminar el mensaje en SQS
  const deleteParams = {
    QueueUrl: 'https://sqs.us-east-2.amazonaws.com/872515257475/Toyoxpress',
    ReceiptHandle: body.receiptHandle
  };

  // Comando para eliminar el mensaje
    const deleteCommand = new DeleteMessageCommand(deleteParams);
    
    // Envío del comando para eliminar el mensaje en SQS
    await client.send(deleteCommand);
    console.log("Mensaje eliminado de SQS");
} else {
  // Creación del producto en WooCommerce
  const response = await WooCommerce.post("products", producto);
  console.log("Respuesta POST", response);

  // Parámetros para eliminar el mensaje en SQS
  const deleteParams = {
    QueueUrl: 'https://sqs.us-east-2.amazonaws.com/872515257475/Toyoxpress',
    ReceiptHandle: body.receiptHandle
  };

  // Comando para eliminar el mensaje
  const deleteCommand = new DeleteMessageCommand(deleteParams);
  
  // Envío del comando para eliminar el mensaje en SQS
  await client.send(deleteCommand);
  console.log("Mensaje eliminado de SQS");

}

sendSSEToClients({ message: `Producto ${body.sku} asignado/actualizado con éxito.`, index: body.index, longitud: body.longitud});
res.status(200).send({ message: "Datos Actualizados con exito!" });
} catch (error) {
console.log(error)
console.log("prueba: ", req.body)
}
}

module.exports = {
  makeProducts,
  assingProducts
}
