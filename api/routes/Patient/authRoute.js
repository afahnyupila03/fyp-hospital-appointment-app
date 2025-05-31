const { auth, restrictTo } = require("../../middlewares/auth");
const {
  registerUser,
  loginUser,
  logoutUser,
  getPatient,
} = require("../../controller/Patient/patientAuth");

module.exports = (router) => {
  router.post("/register", registerUser);
  router.post("/login", loginUser);
  router.get("/me", auth, restrictTo("patient"), getPatient);
  router.post("/logout", auth, restrictTo("patient"), logoutUser);
};
