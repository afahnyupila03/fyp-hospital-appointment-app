const {
  viewAppointments,
  viewAppointment,
  updateAppointment,
} = require("../../controller/Doctor/appointmentController");
const { auth, restrictTo } = require("../../middlewares/auth");

module.exports = (router) => {
  router.get(
    "/view-appointments",
    auth,
    restrictTo("doctor", "admin"),
    viewAppointments
  );
  router.get(
    "/view-appointment/:id",
    auth,
    restrictTo("doctor", "admin"),
    viewAppointment
  );
  router.put(
    "/update-appointment/:id",
    auth,
    restrictTo("doctor"),
    updateAppointment
  );
};
