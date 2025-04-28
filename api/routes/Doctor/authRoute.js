const { auth, restrictTo } = require("../../middlewares/auth");
const {
  loginDoctor,
  logoutDoctor,
  getDoctor,
} = require("../../controller/Doctor/authController");

module.exports = (router) => {
  router.post("/login", loginDoctor);
  router.get('/me', auth, restrictTo('doctor'), getDoctor)
  router.post("/logout", auth, restrictTo("doctor"), logoutDoctor);
};
