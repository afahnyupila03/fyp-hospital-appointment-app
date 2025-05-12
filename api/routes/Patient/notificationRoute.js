const { auth, restrictTo } = require("../../middlewares/auth");
const {
  notification,
  notifications,
  updateNotification,
  requestNotificationPermission,
} = require("../../controller/Patient/notificationController");

module.exports = (router) => {
  router.post(
    "notification-permission",
    auth,
    restrictTo("patient"),
    requestNotificationPermission
  );
  router.get("/notifications", auth, restrictTo("patient"), notifications);
  router.get("/notification", auth, restrictTo("patient"), notification);
  router.put(
    "/update-notification/:id",
    auth,
    restrictTo("patient"),
    updateNotification
  );
};
