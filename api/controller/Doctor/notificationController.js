const { StatusCodes } = require('http-status-codes')
const Notification = require('../../models/notification')
const Doctor = require('../../models/doctor')
const Appointment = require('../../models/appointment')

exports.requestNotificationPermission = async (req, res) => {
  try {
    const doctorId = req.user.id
    const { granted } = req.body

    await Doctor.findByIdAndUpdate(doctorId, {
      notificationPermission: granted
    })

    res.status(StatusCodes.OK).json({
      message: 'Notification permission grant success'
    })
  } catch (error) {
    console.error('error granting notification permission: ', error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to change user notification default state',
      error: error.message
    })
  }
}

exports.viewNotifications = async (req, res) => {
  try {
    const doctorId = req.user.id
    const { page, limit } = req.query

    if (!doctorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'User not authenticated. Please log in again.'
      })
    }

    const notifications = await Notification.find({
      receiver: doctorId
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('receiver', '-password')
      .populate('sender', '-password')
      .populate({
        path: 'appointment',
        populate: {
          path: 'patientId',
        }
      })

    const count = await Notification.countDocuments({ receiver: doctorId })
    const totalPages = Math.ceil(count / limit)
    const currentPage = parseInt(page)

    res.status(StatusCodes.OK).json({
      message: 'doctor notifications',
      notifications,
      count,
      totalPages,
      currentPage
    })
  } catch (error) {
    console.error('view notifications controller error: ', error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'server error for quering notifications',
      error: error.message
    })
  }
}

exports.viewNotification = async (req, res) => {
  try {
    const { id } = req.params
    const doctorId = req.user.id

    if (!doctorId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Unauthorized access. Please log in.' })
    }

    const notification = await Notification.findOne({
      _id: id,
      receiver: doctorId
    })
      .populate('receiver', '-password')
      .populate('sender', '-password')
      .populate({
        path: 'appointment',
        populate: {
          path: 'patientId',
          select: 'name email' // <— important!
        }
      })

    if (!notification) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Notification not found'
      })
    }

    // Auto change notification status from 'read' to 'unread'.
    if (notification.status === 'unread') {
      notification.status = 'read'
      await notification.save()
    }

    res.status(StatusCodes.OK).json({
      message: 'doctor notification',
      notification
    })
  } catch (error) {
    console.error('view notification controller error: ', error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'server error for quering notification',
      error: error.message
    })
  }
}

exports.updateNotification = async (req, res) => {
  try {
    const doctorId = req.user.id
    const { id } = req.params
    const { status } = req.body

    if (!doctorId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Unauthorized access. Please log in.' })
    }

    const allowedStatuses = ['read', 'unread']
    if (!allowedStatuses.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid status value. Must be 'read' or 'unread'."
      })
    }

    const notification = await Notification.findById(id)
      .populate('receiver', '-password')
      .populate('sender', '-password')
      .populate('appointment')

    if (!notification) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Notification not found.'
      })
    }

    notification.status = status
    await notification.save()

    res.status(StatusCodes.OK).json({
      message: 'notification update success',
      notification
    })
  } catch (error) {
    console.error('update notification controller error: ', error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'server error for updating notification',
      error: error.message
    })
  }
}

exports.deleteNotification = async (req, res) => {
  try {
    const doctorId = req.user.id
    const { id } = req.params

    if (!doctorId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Please reauthenticate account to perform action.' })
    }

    const ids = id.split(',') // Check if id is a comma-separated list.

    //  Fetch all notifications to be deleted.
    const notifications = await Notification.find({
      _id: { $in: ids },
      receiver: doctorId
    })

    if (notifications.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'No notifications found for deletion.'
      })
    }

    // Clean-up related models before deleting.
    for (const notification of notifications) {
      // Remove from Appointment.notifications.
      if (notification.appointment) {
        await Appointment.updateOne(
          { _id: notification.appointment },
          {
            $pull: { notifications: notification._id }
          }
        )
      }

      // Also delete from Doctor model.
      await Doctor.updateOne(
        { _id: doctorId },
        { $pull: { notifications: notification._id } }
      )
    }

    // Delete notifications.
    await Notification.deleteMany({
      _id: { $in: notifications.map(n => n._id) }
    })

    res.status(StatusCodes.OK).json({
      message: 'Notification(s) delete success'
    })
  } catch (error) {
    console.log('error deleting doctor notification(s)')
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting doctor notification(s)',
      error: error.message
    })
  }
}
