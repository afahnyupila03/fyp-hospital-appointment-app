const express = require("express");

const appointmentRoute = require("./appointmentRoute");
const notificationRoute = require("./notificationRoute");
const authRoute = require("./authRoute");

const router = express.Router();

authRoute(router);
appointmentRoute(router);
notificationRoute(router);

module.exports = router;
