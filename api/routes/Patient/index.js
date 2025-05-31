const express = require("express");

const authRoute = require("./authRoute");
const appointmentRoute = require("./appointmentRoute");
const notificationRoute = require("./notificationRoute");

const router = express.Router();

authRoute(router);
appointmentRoute(router);
notificationRoute(router);

module.exports = router;
