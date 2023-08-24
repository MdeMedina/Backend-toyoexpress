const express = require("express");
const controller = require("../controllers/upload");
const router = express.Router();
const emailer = require("../../config/emailer");

router.post("/", controller.upload, controller.uploadFile);
router.post("/sendMail", async (req, res) => {
  const { body } = req;
  const filename = body.filename;
  const email = body.email;
  const nota = body.nota;
  const corr = body.corr;

  let send = await emailer.sendMail(filename, email, nota, corr);
  console.log(send);
  res.send(send);
});

module.exports = router;
