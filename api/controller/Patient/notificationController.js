const { StatusCodes } = require('http-status-codes')

const Notification = require('../../models/notification')
const User = require('../../models/user')

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
    const { page = 1, limit = 10 } = req.query

    if (!patientId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Unauthorized access. Please log in.' })
    }

    const notifications = await Notification.find({
      $or: [{ sender: patientId }, { receiver: patientId }]
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('receiver')
      .populate('sender')
      .populate('appointment')

    const count = await Notification.countDocuments({
      $or: [{ sender: patientId }, { receiver: patientId }]
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
      $or: [{ sender: patientId }, { receiver: patientId }]
    })
      .populate('receiver')
      .populate('sender')
      .populate('appointment')

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
      .populate('receiver')
      .populate('sender')
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
