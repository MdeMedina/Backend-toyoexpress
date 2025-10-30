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
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_DEV,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_DEV,
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
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/465836752361/Productos.fifo",
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

    // Separar SKUs existentes y no existentes
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

    // 🔹 Preparar data de batch (con precios como string)
    const data = {
      create: crear.map(p => p.toObject()),
      update: actualizar.map(p => {
        const prod = p.toObject ? p.toObject() : p;

        return {
          id: prod.id,
          sku: prod.sku,
          name: prod.name,
          regular_price: prod.regular_price?.toString() || prod.price?.toString() || "",
          sale_price: prod.sale_price?.toString() || "",
          stock_quantity: Number(prod.stock_quantity ?? 0),
          manage_stock: true,
          status: prod.status || "publish",
          attributes: prod.attributes || [],
          meta_data: prod.meta_data || [],
        };
      }),
    };

    // Mostrar un resumen del batch
    console.log("📦 Productos preparados para WooCommerce:");
    data.update.slice(0, 5).forEach((p, i) =>
      console.log(`   ${i + 1}. ID: ${p.id} | SKU: ${p.sku} | Precio: ${p.regular_price} | Stock: ${p.stock_quantity}`)
    );
    if (data.update.length > 5) console.log(`   ... y ${data.update.length - 5} más.`);

    // 🔍 Verificación posterior
    const verificarActualizacion = async (productos) => {
      const idsQuery = productos.map(p => p.id).join(',');
      const resp = await WooCommerce.get("products", { include: idsQuery, per_page: 100 });
      const wooData = resp.data;

      return productos.map(local => {
        const wooProd = wooData.find(p => p.id === local.id);
        if (!wooProd)
          return { ...local, verified: false, reason: "No encontrado en WooCommerce" };

        const stockOk = wooProd.stock_quantity === local.stock_quantity;
        const priceOk =
          wooProd.regular_price === local.regular_price?.toString() ||
          wooProd.price === local.price?.toString();

        return {
          ...local,
          verified: stockOk && priceOk,
          wooData: wooProd,
          reason: !stockOk
            ? "Stock no coincide"
            : !priceOk
            ? "Precio no coincide"
            : "OK",
        };
      });
    };

    // 🔁 Reintento con logs resumidos
    const reintentarActualizacion = async (productos, intento = 1, maxIntentos = 3) => {
      console.log(`🔁 Intento ${intento}/${maxIntentos} para ${productos.length} productos...`);

      const dataRetry = { update: productos };
      try {
        await WooCommerce.post("products/batch", dataRetry);
      } catch (err) {
        console.error(`❌ Error en intento ${intento}:`, err.response?.data || err.message);
      }

      await new Promise(r => setTimeout(r, 2000));

      const verificados = await verificarActualizacion(productos);
      const noActualizados = verificados.filter(p => !p.verified);

      if (noActualizados.length > 0) {
        console.warn(`⚠️ ${noActualizados.length} productos aún no actualizados:`);
        noActualizados.forEach(p => console.warn(`   ➤ ${p.sku} | ${p.reason}`));
      }

      if (noActualizados.length > 0 && intento < maxIntentos) {
        await new Promise(r => setTimeout(r, intento * 2000));
        return await reintentarActualizacion(noActualizados, intento + 1, maxIntentos);
      }

      return verificados;
    };

    // 🚀 Enviar batch inicial
    await WooCommerce.post("products/batch", data);
    console.log("✅ Batch enviado a WooCommerce.");

    await new Promise(r => setTimeout(r, 2000));

    let verificados = await verificarActualizacion(actualizar);
    let noActualizados = verificados.filter(p => !p.verified);

    if (noActualizados.length > 0) {
      console.warn(`⚠️ ${noActualizados.length} productos no actualizados, reintentando...`);
      const recheck = await reintentarActualizacion(noActualizados);
      verificados = [...verificados.filter(p => p.verified), ...recheck];
    }

    const allVerified = verificados.every(p => p.verified);

    if (!allVerified) {
      const fallidos = verificados.filter(p => !p.verified);
      console.error("❌ Productos no actualizados tras 3 intentos:");
      fallidos.forEach(p => {
        console.error(
          `   ➤ ${p.sku} | Esperado: ${p.regular_price} | Woo: ${p.wooData?.regular_price} | Motivo: ${p.reason}`
        );
      });

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

    console.log("✅ Todos los productos actualizados correctamente en WooCommerce.");

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
