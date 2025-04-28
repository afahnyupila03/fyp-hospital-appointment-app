const express = require("express");

const appointmentRoute = require("./appointmentRoute");
const authRoute = require("./authRoute");

const router = express.Router();

authRoute(router);
appointmentRoute(router);

module.exports = router;
