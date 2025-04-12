const { auth, restrictTo } = require("../../middlewares/auth");
const {
  loginDoctor,
  logoutDoctor,
} = require("../../controller/Doctor/authController");

module.exports = (router) => {
  router.post("/login", loginDoctor);
  router.post("/logout", auth, restrictTo("doctor"), logoutDoctor);
};
