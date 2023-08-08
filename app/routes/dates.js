const express = require(`express`);
const router = express.Router();
const { getTime, createTime, updateTime } = require("../controllers/time");

router.get("/", getTime);

router.put("/update", updateTime);

module.exports = router;
