const express = require("express");
const controller = require("../controllers/upload");
const router = express.Router();
const emailer = require("../../config/emailer");
const isAuthenticated = require("../middleware/isAuth");

router.post("/", controller.upload, controller.uploadFile);
router.post("/sendMail", isAuthenticated, async (req, res) => {
  const { body } = req;
  console.log(body);
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
