const {
  initAdmin,
  loginAdmin,
  logoutAdmin,
  getAdmin,
} = require("../../controller/Admin/adminAuth");

const { auth, restrictTo } = require("../../middlewares/auth");

module.exports = (router) => {
  router.post("/register", initAdmin);
  router.post("/login", loginAdmin);
  router.get('/me', auth, restrictTo('admin'), getAdmin)
  router.post("/logout", auth, restrictTo("admin"), logoutAdmin);
};
