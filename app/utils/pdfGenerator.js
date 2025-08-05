const React = require("react");
const MyDocument = require("./documento"); // CommonJS o export default, depende cómo lo tengas

async function generarPDF(datosCliente, datos, total, items, nota, correlativo, hora, User) {
  // ✅ Import dinámico del módulo ESM
  const { renderToStream } = await import('@react-pdf/renderer');

  const pdfStream = await renderToStream(
    React.createElement(MyDocument, {
      datosCliente,
      datos,
      total,
      items,
      nota,
      correlativo,
      hora,
      User,
    })
  );

  return new Promise((resolve, reject) => {
    const chunks = [];
    pdfStream.on("data", (chunk) => chunks.push(chunk));
    pdfStream.on("end", () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer); // Buffer del PDF listo
    });
    pdfStream.on("error", reject);
  });
}

module.exports = generarPDF;
