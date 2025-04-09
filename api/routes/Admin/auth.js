const {
  initAdmin,
  loginAdmin,
  logoutAdmin,
} = require("../../controller/Admin/adminAuth");

const { auth, restrictTo } = require("../../middlewares/auth");

const express = require("express");

const router = express.Router();

router.post("/register", initAdmin);
router.post("/login", loginAdmin);
router.post("/logout", auth, restrictTo("admin"), logoutAdmin);

module.exports = router;
