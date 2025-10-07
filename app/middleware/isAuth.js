const express = require('express');
const validateJwt = require('./validateJwt');
const findAndAssignUser = require('./findUser');

const isAuthenticated = express.Router().use((req, res, next) => {
  console.time("🧭 isAuthenticated TOTAL");
  res.on("finish", () => console.timeEnd("🧭 isAuthenticated TOTAL"));
  next();
}, validateJwt, findAndAssignUser);

module.exports = isAuthenticated;