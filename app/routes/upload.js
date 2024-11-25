const express = require("express");
const controller = require("../controllers/upload");
const router = express.Router();
const emailer = require("../../config/emailer");

router.post("/", controller.upload, controller.uploadFile);
router.post("/sendMail", async (req, res) => {
  const { body } = req;
  const { mailOptions } = body;
  console.log(mailOptions)
  const filename = mailOptions.filename;
  const email = mailOptions.email;
  const nota = mailOptions.nota;
  const corr = mailOptions.corr;
  const nCliente = mailOptions.nCliente;

  let send = await emailer.sendMail(filename, email, nota, corr, nCliente);

  console.log(send);
  res.send(send);
});

module.exports = router;
