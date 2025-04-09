const express = require("express");
const router = express.Router();

const { auth, restrictTo } = require("../../middlewares/auth");
const {
  loginDoctor,
  logoutDoctor,
} = require("../../controller/Doctor/authController");

router.post('/login', restrictTo("doctor"), loginDoctor)
router.post('/logout', auth, logoutDoctor)

module.exports = router;
