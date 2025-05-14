const { StatusCodes } = require('http-status-codes')

const Notification = require('../../models/notification')
const User = require('../../models/user')
const Appointment = require('../../models/appointment')

exports.requestNotificationPermission = async () => {
  try {
    const patientId = req.user.id
    const { granted } = req.body

    await User.findByIdAndUpdate(patientId, {
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

exports.notifications = async (req, res) => {
  try {
    const patientId = req.user.id
    const { page, limit } = req.query

    if (!patientId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Unauthorized access. Please log in.' })
    }

    const notifications = await Notification.find({
      receiver: patientId
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('receiver', '-password')
      .populate('sender', '-password')
      .populate({
        path: 'appointment',
        populate: {
          path: 'doctorId',
          populate: 'name email'
        }
      })

    const count = await Notification.countDocuments({
      receiver: patientId
    })
    const totalPages = Math.ceil(count / limit)
    const currentPage = parseInt(page)

    res.status(StatusCodes.OK).json({
      message: 'patient notifications',
      notifications,
      count,
      totalPages,
      currentPage
    })
  } catch (error) {
    console.error('server error querying patient notifications: ', error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'error quering patient notifications',
      error: error.message
    })
  }
}

exports.notification = async (req, res) => {
  try {
    const patientId = req.user.id
    const { id } = req.params

    if (!patientId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Unauthorized access. Please log in.' })
    }

    const notification = await Notification.findOne({
      _id: id,
      receiver: patientId
    })
      .populate('receiver', '-password')
      .populate('sender', '-password')
      .populate({
        path: 'appointment',
        populate: {
          path: 'doctorId',
          populate: 'name, email'
        }
      })

    if (!notification) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Notification does not exist'
      })
    }

    // Auto change notification status from 'read' to 'unread'.
    if (notification.status === 'unread') {
      notification.status = 'read'
      await notification.save()
    }

    res.status(StatusCodes.OK).json({
      message: 'patient notification',
      notification
    })
  } catch (error) {
    console.error('server error querying patient notification: ', error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'error quering patient notification',
      error: error.message
    })
  }
}

exports.updateNotification = async (req, res) => {
  try {
    const patientId = req.user.id
    const { id } = req.params
    const { status } = req.body

    if (!patientId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Unauthorized access. Please log in.' })
    }

    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'notification does not exist' })
    }

    const notification = await Notification.findOne({
      _id: id,
      $or: [{ sender: patientId }, { receiver: patientId }]
    })
      .populate('receiver', '-password')
      .populate('sender', '-password')
      .populate('appointment')

    if (!notification) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'notification does not exist'
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
    const patientId = req.user.id
    const { id } = req.params

    if (!patientId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Please reauthenticate account to perform action.' })
    }

    const ids = id.split(',') // Check if id is a comma-separated list.

    //  Fetch all notifications to be deleted.
    const notifications = await Notification.find({
      _id: { $in: ids },
      receiver: patientId
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

      // Remove from User.notifications (either receiver or sender).
      await User.updateMany(
        { _id: patientId },
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
    console.log('error deleting patient notification(s)')
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error deleting patient notification(s)',
      error: error.message
    })
  }
}
