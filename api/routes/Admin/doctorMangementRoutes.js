const express = require("express");

const router = express.Router();

const { auth, restrictTo } = require("../../middlewares/auth");

const {
  createDoctor,
  viewDoctors,
  viewDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../../controller/Admin/doctorManagementController");

router.post("/create-doctor", auth, restrictTo("admin"), createDoctor);
router.get("/doctors", auth, restrictTo("admin"), viewDoctors);
router.get("/doctor/:id", auth, restrictTo("admin"), viewDoctor);
router.put("/update-doctor/:id", auth, restrictTo("admin"), updateDoctor);
router.delete("/delete-doctor/:id", auth, restrictTo("admin"), deleteDoctor);

module.exports = router;
