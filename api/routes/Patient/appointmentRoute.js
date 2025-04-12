const {
  viewAppointments,
  viewAppointment,
  createAppointment,
  updateAppointment,
} = require("../../controller/Patient/appointments");
const { auth, restrictTo } = require("../../middlewares/auth");

module.exports = (router) => {
  router.get(
    "/view-appointments",
    auth,
    restrictTo("patient"),
    viewAppointments
  );
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
};
