const {
  initAdmin,
  loginAdmin,
  logoutAdmin,
} = require("../../controller/Admin/adminAuth");

const { auth, restrictTo } = require("../../middlewares/auth");

module.exports = (router) => {
  router.post("/register", initAdmin);
  router.post("/login", loginAdmin);
  router.post("/logout", auth, restrictTo("admin"), logoutAdmin);
};
