const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const createTrans = () => {
  const transport = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "pedidosweb@toyoxpress.com",
      pass: "]Zb3v>6lq:S4",
    },
  });
  return transport;
};

function getFileByFilename(filename) {
  console.log(filename);
  const filePath = path.join("uploads", filename);
  try {
    const file = fs.readFileSync(filePath);
    return file;
  } catch (error) {
    return null;
  }
}

const sendMail = async (filename, correo, nota, corr, nCliente) => {
  let str;
  if (!nota) {
    str = "Envio de pdf adjunto desde Toyoxpress.com";
  } else {
    str = nota;
  }
  const transporter = createTrans();
  let pdfContent = getFileByFilename(filename);
  const mailOptions = {
    from: "pedidosweb@toyoxpress.com", // Reemplaza con tu dirección de correo electrónico
    to: correo, // Reemplaza con la dirección de correo del destinatario
    subject: `Pedido n°${corr} ${nCliente}`,
    text: str,
    headers: {
      "X-Mailer": "Toyoxpress Mailer v1.0",
      "X-Priority": "3",
      "X-MSMail-Priority": "Normal",
      "Importance": "Normal",
      "Return-Path": "pedidosweb@toyoxpress.com",
      "Reply-To": "pedidosweb@toyoxpress.com",
    },
    attachments: [
      {
        filename: filename, // Nombre del archivo adjunto que se mostrará en el correo
        content: pdfContent, // Contenido del PDF que se enviará
      },
    ],
  };
  // Envía el correo electrónico
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      let def = { str: "Error al enviar el correo:", info: error };
      return def;
    } else {
      let def = { str: "Correo electrónico enviado:", info: info.response };
      return def;
    }
  });

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  //
  // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
  //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
  //       <https://github.com/forwardemail/preview-email>
  //
};

exports.sendMail = (filename, correo, nota, corr, nCliente) =>
  sendMail(filename, correo, nota, corr, nCliente);