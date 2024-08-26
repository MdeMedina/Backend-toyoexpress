const { Producto } = require("../models/product");

const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"; // Supports ESM

const WooCommerce = new WooCommerceRestApi({
  url: 'https://pruebas.toyoxpress.com/',
  consumerKey: 'ck_252527c6a32ea50bbd68947d7f315eab83475a70',
  consumerSecret: 'cs_8d2c05c03fa99e107891eae7348b31ae36fdb395',
  version: 'wc/v3',
  queryStringAuth: true // Force Basic Authentication as query string true and using under HTTPS
})

const client = new SQSClient({ region: "us-east-1" }); 




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
    let arrayBueno = body.map(producto => {
      return {  
        name: producto["Nombre Corto"],
        sku: producto.Código,
        price: producto["Precio Mayor"],
        regular_price: producto["Precio Minimo"],
        sale_price: producto["Precio Oferta"],
        manage_stock: true,
        stock_quantity: producto["Existencia Actual"],
        attributes: [{
          id: 1,
          name: "Marca",
          position: 0,
          visible: true,
          variation: false,
          options: [producto.Marca]
  }]}
    })
    const skus = body.map(producto => producto.Código);

 await Productos.deleteMany({}, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log(
        "Todos los documentos de la colección de productos han sido eliminados."
      );
    }
  });
  await Productos.insertMany(body);

  for (sku in skus) {
    const params = {
      QueueUrl: "https://sqs.us-east-2.amazonaws.com/872515257475/Toyoxpress",
      MessageBody: {sku: sku},
};
    const command = new SendMessageCommand(params);
try {
    const data = await client.send(command);
   console.log("Mensaje enviado con éxito:", data);
} catch (error) {
  console.error("Error al enviar el mensaje:", error);
}
  }

  
    } catch (error) {
    console.error(error.response.data)
    throw error;
  }

}

const assingProducts = async (req, res) => {
try {
const {body} = req
const producto = Producto.findOne({sku: body.sku})
if (body.exits) {
  WooCommerce.put(`products?sku=${body.sku}`, producto).then((response) => {
    console.log(response.data)
  })
} else {
  WooCommerce.post("products", producto)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
}
} catch (error) {
console.log(error)
}
}

module.exports = {
  makeProducts,
  assingProducts
}
