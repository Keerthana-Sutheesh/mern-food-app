const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/auth");

router.post("/register", (req, res, next) => {
  console.log("Register route hit with body:", req.body);
  next();
}, register);
router.post("/login", (req, res, next) => {
  console.log("Login route hit with body:", req.body);
  next();
}, login);

module.exports = router;
