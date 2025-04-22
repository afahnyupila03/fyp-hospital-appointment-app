const {
  viewAppointments,
  viewAppointment,
  createAppointment,
  updateAppointment,
  viewDoctors,
  viewDoctor,
} = require("../../controller/Patient/appointments");
const { auth, restrictTo } = require("../../middlewares/auth");

module.exports = (router) => {
  router.get(
    "/view-appointments",
    auth,
    restrictTo("admin"),
    restrictTo("patient"),
    viewAppointments
  );
  router.get(
    "/view-appointment/:id",
    auth,
    restrictTo("patient"),
    restrictTo("admin"),
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
  router.get("/doctors", auth, restrictTo("patient"), viewDoctors);
  router.get("/doctors", auth, restrictTo("patient"), viewDoctor);
};
