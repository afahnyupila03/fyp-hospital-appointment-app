const express = require("express");
const router = express.Router();

const { auth, restrictTo } = require("../../middlewares/auth");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../../controller/Patient/patientAuth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", auth, restrictTo("patient"), logoutUser);

module.exports = router;
