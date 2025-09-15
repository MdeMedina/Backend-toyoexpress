const express = require(`express`);
const router = express.Router();
const { getTime, createTime, updateTime } = require("../controllers/time");
const isAuthenticated = require("../middleware/isAuth");

router.get("/", isAuthenticated ,getTime);

router.put("/update", isAuthenticated ,updateTime);

module.exports = router;
