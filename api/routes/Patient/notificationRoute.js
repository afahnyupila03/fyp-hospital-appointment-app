const { auth, restrictTo } = require("../../middlewares/auth");
const {
  notification,
  notifications,
  updateNotification,
} = require("../../controller/Patient/notificationController");

module.exports = (router) => {
  router.get("/notifications", auth, restrictTo("patient"), notifications);
  router.get("/notification", auth, restrictTo("patient"), notification);
  router.put(
    "/update-notification/:id",
    auth,
    restrictTo("patient"),
    updateNotification
  );
};
