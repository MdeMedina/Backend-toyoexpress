const { Producto } = require("../models/product");
const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const { SQSClient, SendMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");
const fs = require("fs");
const path = require("path");

// Cargar el archivo JSON de categorías
const categoriasPath = path.join(__dirname, "../utils/codigos_categoria.json");
const categoriasData = JSON.parse(fs.readFileSync(categoriasPath, "utf8"));

// Función para buscar la categoría por nombre (comparación sin sensibilidad a mayúsculas/minúsculas)
const normalizarTextoCategoria = (texto) => {
  if (texto === null || texto === undefined) return "";

  return String(texto)
    .trim()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s*&\s*/g, "&")
    .replace(/\s+/g, " ")
    .toLowerCase();
};

const buscarCategoriaPorNombre = (nombreMarca) => {
  if (!nombreMarca) {
    console.log("🔎 buscarCategoriaPorNombre: nombreMarca vacío o null.");
    return null;
  }

  const nombreMarcaNormalizado = normalizarTextoCategoria(nombreMarca);
  console.log(
    `🔎 buscarCategoriaPorNombre: nombreMarca original="${nombreMarca}" | normalizado="${nombreMarcaNormalizado}"`
  );

  // Buscar coincidencia exacta primero (normalizada)
  let categoriaEncontrada = categoriasData.find(cat => {
    const categoriaNormalizada = normalizarTextoCategoria(cat.CATEGORIA);
    const coincide = categoriaNormalizada === nombreMarcaNormalizado;
    console.log(
      `🔎 Comparación EXACTA | categoria="${cat.CATEGORIA}" | normalizada="${categoriaNormalizada}" | coincide=${coincide}`
    );
    return coincide;
  });

  // Si no hay coincidencia exacta, buscar que contenga el texto
  if (!categoriaEncontrada) {
    categoriaEncontrada = categoriasData.find(cat => {
      const categoriaNormalizada = normalizarTextoCategoria(cat.CATEGORIA);
      const contiene =
        categoriaNormalizada.includes(nombreMarcaNormalizado) ||
        nombreMarcaNormalizado.includes(categoriaNormalizada);
      console.log(
        `🔎 Comparación CONTAINS | categoria="${cat.CATEGORIA}" | normalizada="${categoriaNormalizada}" | contiene=${contiene}`
      );
      return contiene;
    });
  }

  if (categoriaEncontrada) {
    console.log(
      `✅ Categoría encontrada: "${categoriaEncontrada.CATEGORIA}" (ID WC ${categoriaEncontrada["ID WC"]})`
    );
  } else {
    console.log("⚠️ Categoría no encontrada tras comparaciones.");
  }

  return categoriaEncontrada;
};




// Inicializa el cliente de WooCommerce
const WooCommerce = new WooCommerceRestApi({
  url: 'https://toyoxpress.com/',
  consumerKey: 'ck_a13ab00a4fb0397be1af94598ff616e5852c8d64',
  consumerSecret: 'cs_e4b8eab412487d87b938bb46d60b966afcf4f4fd',
  version: 'wc/v3',
  queryStringAuth: true, // Forzar autenticación básica en la cadena de consulta (HTTPS)
});


const client = new SQSClient({   region: process.env.AWS_REGION,   credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID_DEV,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_DEV,
  }}); 


let arrayChunked = []
let arrayComprobatorio = []

const formatError = (error) => {
  if (!error) return "Error desconocido";
  if (error.response?.data) {
    try {
      return JSON.stringify(error.response.data);
    } catch (stringifyError) {
      return String(error.response.data);
    }
  }
  return error.message || String(error);
};



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
      // Buscar la categoría correspondiente según producto.Marca
      const categoriaEncontrada = buscarCategoriaPorNombre(producto.Marca);
      
      // Construir el objeto de categorías para WooCommerce
      let categories = [];
      if (categoriaEncontrada) {
        // Si se encontró la categoría, usar el ID WC
        categories = [
          {
            id: categoriaEncontrada["ID WC"]
          }
        ];
        console.log(`✅ Categoría encontrada para ${producto.Marca}: ID WC ${categoriaEncontrada["ID WC"]} (${categoriaEncontrada.CATEGORIA})`);
      } else {
        // Si no se encuentra, usar solo el nombre como fallback
        categories = [];
        console.warn(`⚠️ Categoría no encontrada para "${producto.Marca}", usando solo nombre`);
      }
      console.log("producto: ", producto)
      
      return {  
        name: producto["Nombre Corto"],
        sku: producto.Código,
        price: producto["Precio Minimo"],
        regular_price: producto["Precio Minimo"],
        sale_price: "",
        manage_stock: true,
        status: "publish",
        stock_quantity: producto["Existencia Actual"],
        attributes: [{
          id: 1,
          name: "Marca",
          position: 0,
          visible: true,
          variation: false,
          options: [producto.Modelo]
  }],
  categories: categories,
  meta_data: [{ key: 'cliente 2 price', value: producto["Precio Mayor"] },
      {
    key: 'festiUserRolePrices',
    value: `{"cliente2":"${producto["Precio Mayor"]}","salePrice":{"cliente2":""},"schedule":{"cliente2":{"date_from":"","date_to":""}}}`
  }
  ],
}
    })
    const skus = data.map(producto => producto.Código);
    arrayChunked = splitArrayIntoChunks(skus, 50)
  try {
    await Producto.deleteMany({});
    console.log(
      "Todos los documentos de la colección de productos han sido eliminados."
    );
  } catch (error) {
    const message = `Error al eliminar productos en Mongo: ${formatError(error)}`;
    console.error(message);
    global.shared?.logError?.(message);
    return res.status(500).send({ message });
  }

  try {
    await Producto.insertMany(arrayBueno);
    console.log("Productos insertados correctamente en la base de datos.");
  } catch (error) {
    const message = `Error al insertar productos en Mongo: ${formatError(error)}`;
    console.error(message);
    global.shared?.logError?.(message);
    return res.status(500).send({ message });
  }
  const params = {
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/465836752361/Productos.fifo",
    MessageBody: JSON.stringify({arr: arrayChunked[0], index: 0, maximo: length, nombre: body.nombre}),
    MessageGroupId: "grupo-1",
    MessageDeduplicationId: `0`, 
  };
  console.log(params)
  const command = new SendMessageCommand(params);
  try {
    await client.send(command);
    console.log("Mensaje enviado: ", 0);
  } catch (error) {
    const message = `Error al enviar el mensaje SQS de productos: ${formatError(error)}`;
    console.error(message);
    global.shared?.logError?.(message);
  }



    res.status(200).send({ message: "Excel Actualizado con éxito!" });
} else {
  res.status(400).send({ message: "Error al actualizar el Excel" });
}
    } catch (error) {
    const message = `Error general en makeProducts: ${formatError(error)}`;
    console.error(message);
    global.shared?.logError?.(message);
    sendError();
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
          categories: prod.categories || [],
          meta_data: prod.meta_data || [],
        };
      }),
    };

    const sinCategoriasCreate = data.create.filter(p => !p.categories || p.categories.length === 0);
    const sinCategoriasUpdate = data.update.filter(p => !p.categories || p.categories.length === 0);
    if (sinCategoriasCreate.length > 0 || sinCategoriasUpdate.length > 0) {
      console.warn(
        `⚠️ Productos sin categorías | create=${sinCategoriasCreate.length} | update=${sinCategoriasUpdate.length}`
      );
      sinCategoriasCreate.slice(0, 5).forEach(p =>
        console.warn(`   ➤ create sin categorías | SKU: ${p.sku} | Nombre: ${p.name}`)
      );
      sinCategoriasUpdate.slice(0, 5).forEach(p =>
        console.warn(`   ➤ update sin categorías | SKU: ${p.sku} | Nombre: ${p.name}`)
      );
    }

    // Mostrar un resumen del batch
    console.log("📦 Productos preparados para WooCommerce:");
    data.update.slice(0, 5).forEach((p, i) =>
      console.log(
        `   ${i + 1}. ID: ${p.id} | SKU: ${p.sku} | Precio: ${p.regular_price} | Stock: ${p.stock_quantity} | Categorías: ${p.categories?.length || 0}`
      )
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
        const message = `Error en intento ${intento} WooCommerce: ${formatError(err)}`;
        console.error(`❌ ${message}`);
        global.shared?.logError?.(message);
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
    try {
      await WooCommerce.post("products/batch", data);
      console.log("✅ Batch enviado a WooCommerce.");
    } catch (error) {
      const message = `Error al enviar batch a WooCommerce: ${formatError(error)}`;
      console.error(message);
      global.shared?.logError?.(message);
      throw error;
    }

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
        QueueUrl: "https://sqs.us-east-1.amazonaws.com/465836752361/Productos.fifo",
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
    const message = `Error general en assingProducts: ${formatError(error)}`;
    console.error("❌ Error general:", message);
    global.shared?.logError?.(message);
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
