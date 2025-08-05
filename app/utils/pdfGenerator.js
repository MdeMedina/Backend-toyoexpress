const React = require("react");
const ReactDOMServer = require("react-dom/server");
const { renderToStream } = require("@react-pdf/renderer");
const fs = require("fs");
const MyDocument = require("./documento"); // usa `export default` en el archivo del documento

async function generarPDF(datosCliente, datos, total, items, nota, correlativo, hora, User) {
  const pdfStream = await renderToStream(
    React.createElement(MyDocument, {
      datosCliente, datos, total, items, nota, correlativo, hora, User
    })
  );

  return new Promise((resolve, reject) => {
    const chunks = [];
    pdfStream.on("data", chunk => chunks.push(chunk));
    pdfStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer); // Aquí tienes tu "blob" en backend
    });
    pdfStream.on("error", reject);
  });
}

module.exports = generarPDF;
