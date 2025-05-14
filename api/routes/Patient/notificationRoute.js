const { auth, restrictTo } = require('../../middlewares/auth')
const {
  notification,
  notifications,
  updateNotification,
  deleteNotification,
  requestNotificationPermission
} = require('../../controller/Patient/notificationController')

module.exports = router => {
  router.post(
    'notification-permission',
    auth,
    restrictTo('patient'),
    requestNotificationPermission
  )
  router.get('/notifications', auth, restrictTo('patient'), notifications)
  router.get('/notification/:id', auth, restrictTo('patient'), notification)
  router.put(
    '/update-notification/:id',
    auth,
    restrictTo('patient'),
    updateNotification
  )
  router.delete(
    '/delete-notification/:id',
    auth,
    restrictTo('patient'),
    deleteNotification
  )
}
