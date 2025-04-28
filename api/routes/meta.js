const express = require("express");
const router = express.Router();

const { specialties, departments } = require("../constants/index");

router.get("/doctor-meta", (req, res) => {
  res.json({
    specialties,
    departments,
  });
});

module.exports = router;
