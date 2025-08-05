const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const createTrans = () => {
  const transport = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // Brevo usa STARTTLS en 587
    auth: {
      user: process.env.BREVO_SMTP_USER, // Usa el correo que tengas verificado en Brevo
      pass: process.env.BREVO_SMTP_PASS, // Es la clave SMTP que te da Brevo (no la API key completa)
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

const sendMail = async (pdfBuffer, correo, nota, corr, nCliente) => {
  const html = `
    <p style="text-align: center;">
      <img src="cid:logoPrincipal" alt="Toyoxpress" style="max-width: 300px; height: auto; margin-bottom: 20px;" />
    </p>
    <p>Hola,</p>
    <p>Comprobante de pedido en <strong>Toyoxpress.com</strong>. Adjuntamos en este correo el archivo PDF con el comprobante de tu pedido.</p>
    ${nota ? `<p><strong>Nota:</strong> ${nota}</p>` : ""}
    <p>Si tienes alguna duda, puedes responder a este correo o escribirnos a <a href="mailto:contacto@toyoxpress.com">contacto@toyoxpress.com</a>.</p>
    <p>Saludos cordiales,<br>Equipo Toyoxpress</p>
  `;

  const transporter = createTrans();


  const mailOptions = {
    from: "pedidosweb@toyoxpress.com", // Debe ser el mismo correo verificado en Brevo
    to: correo,
    subject: `Pedido n°${corr} ${nCliente}`,
    text: nota || "Envio de pdf adjunto desde Toyoxpress.com",
    html: html,
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
        filename: `Pedido_${corr}.pdf`,
        content: pdfBuffer,
      },
      {
        filename: "logo.png",
        path: path.join(__dirname, "../app/img/logo.png"), // ruta a la imagen
        cid: "logoPrincipal", // se referencia en el HTML
      },
    ],
  };

  // Envía el correo electrónico
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
    } else {
      console.log("Correo electrónico enviado:", info.response);
    }
  });
};

exports.sendMail = (pdfBuffer, correo, nota, corr, nCliente) =>
  sendMail(pdfBuffer, correo, nota, corr, nCliente);
