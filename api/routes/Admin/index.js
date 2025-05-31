const express = require("express");

const authRoute = require("./auth");
const doctorManagementRoute = require("./doctorManagementRoutes");
const patientManagementRoute = require("./patientManagementRoute");

const router = express.Router();

authRoute(router);
doctorManagementRoute(router);
patientManagementRoute(router);

module.exports = router;
