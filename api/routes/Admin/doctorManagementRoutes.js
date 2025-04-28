
const { auth, restrictTo } = require("../../middlewares/auth");

const {
  createDoctor,
  viewDoctors,
  viewDoctor,
  updateDoctor,
  archiveDoctor,
  unarchiveDoctor
} = require("../../controller/Admin/doctorManagementController");

module.exports = (router) => {
  router.post("/create-doctor", auth, restrictTo("admin"), createDoctor);
  router.get("/doctors", auth, restrictTo("admin"), viewDoctors);
  router.get("/doctor/:id", auth, restrictTo("admin"), viewDoctor);
  router.put("/update-doctor/:id", auth, restrictTo("admin"), updateDoctor);
  router.put("/archive-doctor/:id", auth, restrictTo("admin"), archiveDoctor);
  router.put("/unarchive-doctor/:id", auth, restrictTo("admin"), unarchiveDoctor);
};
