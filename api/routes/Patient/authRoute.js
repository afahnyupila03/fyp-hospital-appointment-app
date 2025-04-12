const { auth, restrictTo } = require("../../middlewares/auth");
const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../../controller/Patient/patientAuth");

module.exports = (router) => {
  router.post("/register", registerUser);
  router.post("/login", loginUser);
  router.post("/logout", auth, restrictTo("patient"), logoutUser);
};
