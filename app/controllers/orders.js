const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"; // Supports ESM

const WooCommerce = new WooCommerceRestApi({
  url: 'https://pruebas.toyoxpress.com/',
  consumerKey: 'ck_252527c6a32ea50bbd68947d7f315eab83475a70',
  consumerSecret: 'cs_8d2c05c03fa99e107891eae7348b31ae36fdb395',
  version: 'wc/v3',
  queryStringAuth: true // Force Basic Authentication as query string true and using under HTTPS
})

function esCorreoValido(correo) {
  const expresionRegular = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return expresionRegular.test(correo);
}



const sendOrder = async (cliente, productos, corr) => {
  try {
    console.log(corr)
    const wooProducts = productos.map(async producto => {
      const response = await WooCommerce.get(`products?sku=${producto["Código"]}`); 
      return response
    })
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
    email: esCorreoValido(cliente["Correo Electronico"]) ? cliente["Correo Electronico"] : "mamedina770@gmail.com",
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

const data = {
  billing,
  shipping,
  line_items: productsData,
  status: "pedidoapp",
  meta_data:[
        {
            "key": "_numero_pedido_app",
            "value": corr
        }
    ]
};

WooCommerce.post("orders", data)
  .then((response) => {
    console.log(response.data);
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