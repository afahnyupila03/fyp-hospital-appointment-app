const {
  viewNotifications,
  viewNotification,
  updateNotification,
  requestNotificationPermission,
  deleteNotification,
} = require("../../controller/Doctor/notificationController");

const { auth, restrictTo } = require("../../middlewares/auth");

module.exports = (router) => {
  router.post(
    "/notification-permission",
    auth,
    restrictTo("doctor"),
    requestNotificationPermission
  );
  router.get("/notifications", auth, restrictTo("doctor"), viewNotifications);
  router.get("/notification/:id", auth, restrictTo("doctor"), viewNotification);
  router.put(
    "/update-notification/:id",
    auth,
    restrictTo("doctor"),
    updateNotification
  );
  router.delete(
    "/delete-notification/:id",
    auth,
    restrictTo("doctor"),
    deleteNotification
  );
};
