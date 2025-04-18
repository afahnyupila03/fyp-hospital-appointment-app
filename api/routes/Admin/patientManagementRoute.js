const { auth, restrictTo } = require("../../middlewares/auth");
const {
  viewPatients,
  viewPatient,
  archivePatient,
} = require("../../controller/Admin/patientManagementController");

module.exports = (router) => {
  router.get("/view-patients", auth, restrictTo("admin"), viewPatients);
  router.get("/view-patient/:id", auth, restrictTo("admin"), viewPatient);
  router.put("/archive-patient/:id", auth, restrictTo("admin"), archivePatient);
};
