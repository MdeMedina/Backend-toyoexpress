const { Producto } = require("../models/product");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const { SQSClient, SendMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");




// Inicializa el cliente de WooCommerce
const WooCommerce = new WooCommerceRestApi({
  url: 'https://toyoxpress.com/',
  consumerKey: 'ck_a13ab00a4fb0397be1af94598ff616e5852c8d64',
  consumerSecret: 'cs_e4b8eab412487d87b938bb46d60b966afcf4f4fd',
  version: 'wc/v3',
  queryStringAuth: true, // Forzar autenticación básica en la cadena de consulta (HTTPS)
});


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
console.log("Productos insertados correctamente en la base de datos.");
  const params = {
    QueueUrl: "https://sqs.us-east-2.amazonaws.com/872515257475/Toyoxpress.fifo",
    MessageBody: JSON.stringify({arr: arrayChunked[0], index: 0, maximo: length, nombre: body.nombre}),
    MessageGroupId: "grupo-1",
    MessageDeduplicationId: `0`, 
  };
  console.log(params)
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
  const { body } = req;

  try {
    let crear = [];
    const actualizar = [];
    global.shared.resetLog();

    const skusExistentes = [];
    const skusNoExistentes = [];

    for (const product of body.arr) {
      if (product.exists) skusExistentes.push(product.sku);
      else skusNoExistentes.push(product.sku);
    }

    const productosExistentes = await Producto.find({ sku: { $in: skusExistentes } });
    crear = await Producto.find({ sku: { $in: skusNoExistentes } });

    productosExistentes.forEach(product => {
      body.arr.map(pod => {
        if (pod.sku === product.sku) {
          const productoLimpio = product.toObject();
          productoLimpio.id = pod.id_producto;
          actualizar.push(productoLimpio);
        }
      });
    });

    const data = {
      create: crear.map(product => product.toObject()),
      update: actualizar.map(product => product),
    };

    // 🔍 Verificar actualización
    const verificarActualizacion = async (productos) => {
      const idsQuery = productos.map(p => p.id).join(',');
      const resp = await WooCommerce.get("products", { include: idsQuery, per_page: 100 });
      const wooData = resp.data;

      return productos.map(local => {
        const wooProd = wooData.find(p => p.id === local.id);
        if (!wooProd) return { ...local, verified: false, reason: 'Producto no encontrado en WooCommerce' };

        const stockOk = wooProd.stock_quantity === local.stock_quantity;
        const priceOk = !local.price || wooProd.price === local.price;

        return {
          ...local,
          verified: stockOk && priceOk,
          wooData: wooProd,
          reason: !stockOk ? 'Stock no coincide' : (!priceOk ? 'Precio no coincide' : 'OK')
        };
      });
    };

    // 🔁 Reintentar actualización con logs detallados
    const reintentarActualizacion = async (productos, intento = 1, maxIntentos = 3) => {
      console.log(`🔁 Intento ${intento} de actualización (${productos.length} productos)`);

      const dataRetry = { update: productos.map(p => p) };
      try {
        const resp = await WooCommerce.post("products/batch", dataRetry);
        console.log(`📦 Respuesta WooCommerce (intento ${intento}):`, JSON.stringify(resp.data, null, 2));
      } catch (err) {
        console.error(`❌ Error en la petición a WooCommerce (intento ${intento}):`, err.response?.data || err.message);
      }

      await new Promise(r => setTimeout(r, 2000));

      const verificados = await verificarActualizacion(productos);
      const noActualizados = verificados.filter(p => !p.verified);

      if (noActualizados.length > 0) {
        console.warn(`⚠️ ${noActualizados.length} productos aún no se actualizaron correctamente:`);
        noActualizados.forEach(p =>
          console.warn(`   ➤ ${p.id} | ${p.sku || '(sin SKU)'} | Motivo: ${p.reason}`)
        );
      }

      if (noActualizados.length > 0 && intento < maxIntentos) {
        await new Promise(r => setTimeout(r, intento * 2000));
        return await reintentarActualizacion(noActualizados, intento + 1, maxIntentos);
      }

      return verificados;
    };

    // 🚀 Primer intento
    const respBatch = await WooCommerce.post("products/batch", data);
    console.log("✅ Productos enviados a WooCommerce (batch inicial)");
    console.log("📦 Respuesta inicial WooCommerce:", JSON.stringify(respBatch.data, null, 2));

    await new Promise(r => setTimeout(r, 2000));

    let verificados = await verificarActualizacion(actualizar);
    let noActualizados = verificados.filter(p => !p.verified);

    if (noActualizados.length > 0) {
      console.warn(`⚠️ ${noActualizados.length} productos no se actualizaron correctamente, reintentando...`);
      noActualizados.forEach(p =>
        console.warn(`   ➤ ${p.id} | ${p.sku || '(sin SKU)'} | Motivo: ${p.reason}`)
      );
      const recheck = await reintentarActualizacion(noActualizados);
      verificados = [...verificados.filter(p => p.verified), ...recheck];
    }

    const allVerified = verificados.every(p => p.verified);

    if (!allVerified) {
      console.error("❌ Algunos productos NO se actualizaron tras 3 intentos");
      const fallidos = verificados.filter(p => !p.verified);
      console.table(
        fallidos.map(p => ({
          ID: p.id,
          SKU: p.sku,
          Motivo: p.reason,
          StockEsperado: p.stock_quantity,
          StockWoo: p.wooData?.stock_quantity,
          PrecioEsperado: p.price,
          PrecioWoo: p.wooData?.price,
        }))
      );

      global.shared.logError("Productos no actualizados completamente tras reintentos");
      res.status(207).send({
        message: "Algunos productos no se actualizaron correctamente tras varios intentos.",
        detalles: fallidos,
      });
      global.shared.sendToClients(
        JSON.stringify({ index: body.index + 1, maximo: body.maximo, estado: false, nombre: body.nombre })
      );
      return;
    }

    console.log("✅ Todos los productos actualizados correctamente en WooCommerce");

    if (arrayChunked.length > body.index + 1) {
      const params = {
        QueueUrl: "https://sqs.us-east-2.amazonaws.com/872515257475/Toyoxpress.fifo",
        MessageBody: JSON.stringify({
          arr: arrayChunked[body.index + 1],
          index: body.index + 1,
          maximo: body.maximo,
          nombre: body.nombre,
        }),
        MessageGroupId: "grupo-1",
        MessageDeduplicationId: `${body.index + 1}`,
      };

      try {
        await client.send(new SendMessageCommand(params));
      } catch (error) {
        console.error("Error al enviar el mensaje a SQS:", error);
      }
    }

    global.shared.sendToClients(
      JSON.stringify({ index: body.index + 1, maximo: body.maximo, estado: true, nombre: body.nombre })
    );

    global.shared.logInfo(body.index);
    res.status(200).send({ message: "Datos actualizados y verificados exitosamente en WooCommerce." });

  } catch (error) {
    console.error("❌ Error general:", error);
    global.shared.logError(error);
    global.shared.sendToClients(
      JSON.stringify({ index: body.index + 1, maximo: body.maximo, estado: false, nombre: body.nombre })
    );
    res.status(500).send({ message: "Error al procesar la asignación." });
  }
};



module.exports = {
  makeProducts,
  assingProducts
}
