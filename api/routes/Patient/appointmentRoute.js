const express = require("express");
const router = express.Router();

const {
  viewAppointments,
  viewAppointment,
  createAppointment,
  updateAppointment,
} = require("../../controller/Patient/appointments");
const { auth, restrictTo } = require("../../middlewares/auth");

router.get("/view-appointments", auth, restrictTo("patient"), viewAppointments);
router.get(
  "/view-appointment/:id",
  auth,
  restrictTo("patient"),
  viewAppointment
);
router.post(
  "/create-appointment",
  auth,
  restrictTo("patient"),
  createAppointment
);
router.put(
  "/update-appointment/:id",
  auth,
  restrictTo("patient"),
  updateAppointment
);

module.exports = router;
