const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"; // Supports ESM

const WooCommerce = new WooCommerceRestApi({
  url: 'https://toyoxpress.com/',
  consumerKey: 'ck_a13ab00a4fb0397be1af94598ff616e5852c8d64',
  consumerSecret: 'cs_e4b8eab412487d87b938bb46d60b966afcf4f4fd',
  version: 'wc/v3',
  queryStringAuth: true // Force Basic Authentication as query string true and using under HTTPS
})

function esCorreoValido(correos) {
  const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  // Separar por espacios, punto y coma, o comas
  const separados = correos.split(/[\s;,]+/).filter(Boolean);
  
  // Verifica que todos los elementos sean correos válidos
  return separados.every(correo => expresionRegular.test(correo));
}

function extraerCorreosValidos(correos) {
  const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Separar por espacios, punto y coma, o comas
  const posiblesCorreos = correos.split(/[\s;,]+/).filter(Boolean);
  
  // Filtrar solo los correos válidos
  const correosValidos = posiblesCorreos.filter(correo => expresionRegular.test(correo));
  
  return correosValidos;
}


const sendOrder = async (cliente, productos, corr, emails) => {
  try {
    console.log(corr)
    const wooProducts = productos.map(async producto => {
      const response = await WooCommerce.get(`products?sku=${producto["Código"]}`); 
      return response
    })

    let correosADD = extraerCorreosValidos(cliente["Correo Electronico"]).slice(1)
    emails = emails.concat(correosADD)
    let emailAdd = emails.join(",")

    const response = await Promise.all(wooProducts)
    const productsData = response.map(respuesta => {
      let data = respuesta.data;
      let parte = {}
      data.map(dato => {
        productos.map(product => {
          if (product["Código"] === dato.sku) {
            parte["product_id"] = dato.id;
            parte["quantity"] = product["cantidad"];
          }
          
        })
      })
      if(parte.quantity){
        return parte
      }
      })


     let billing = {
    first_name: cliente.Nombre,
    email: esCorreoValido(cliente["Correo Electronico"]) ? extraerCorreosValidos(cliente["Correo Electronico"])[0] : "",
    phone: cliente["Telefonos"],
    address_1: cliente["Direccion"],
    state: cliente["Estado"],
    city: cliente["Ciudad"],
  }
 let shipping = {
    first_name: cliente["Nombre"],
    address_1: cliente["Direccion"],
    state: cliente["Estado"],
    city: cliente["Ciudad"],
  }

let data = {
  billing,
  shipping,
  line_items: productsData,
  status: "pedidoapp",
  meta_data:[
        {
            "key": "_numero_pedido_app",
            "value": corr
        }, {
          "key": "_additional_emails",
          "value": emailAdd
        }
    ]
};

if (cliente["Tipo de Precio"] == "Precio Oferta     "
|| cliente["Tipo de Precio"] == "Precio Oferta") {
  data.apply_role = "cliente2"
}


console.log("data: ",data)
WooCommerce.post("orders", data)
  .then((response) => {
  })
  .catch((error) => {
    console.log(error.response.data);
  })
    
  } catch (error) {
    console.error(error)
    throw error;
  }

}

module.exports = {
  sendOrder
}
