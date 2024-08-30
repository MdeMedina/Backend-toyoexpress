const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
// import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api"; // Supports ESM

const WooCommerce = new WooCommerceRestApi({
  url: 'https://pruebas.toyoxpress.com/',
  consumerKey: 'ck_252527c6a32ea50bbd68947d7f315eab83475a70',
  consumerSecret: 'cs_8d2c05c03fa99e107891eae7348b31ae36fdb395',
  version: 'wc/v3',
  queryStringAuth: true // Force Basic Authentication as query string true and using under HTTPS
})
const getWoo = async () => {
  try {
    const response = await WooCommerce.get(`products?sku=G90919-02259-J`);
    const prueba = []
    const totalProducts = response.headers['x-wp-total'];

    return totalProducts;
  } catch (error) {
    console.error(error.response.data)
    throw error;
  }

}

module.exports = {
  getWoo
}