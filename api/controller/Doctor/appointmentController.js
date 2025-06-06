const { StatusCodes } = require('http-status-codes')

const Appointment = require('../../models/appointment')
const Notification = require('../../models/notification')
const Doctor = require('../../models/doctor')
const User = require('../../models/user')
const Socket = require('../../socket')

exports.viewAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id

    const { page = 1, limit = 10 } = req.query

    console.log('doctor appointments id: ', doctorId)

    const appointments = await Appointment.find({ doctorId })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('doctorId', 'name email specialization department')
      .populate('patientId', 'email name')
      .populate('notifications')
      .sort({ createdAt: -1 })

    const count = await Appointment.find({ doctorId }).countDocuments({
      doctorId
    })
    const totalPages = Math.ceil(count / limit)
    const currentPage = parseInt(page)

    console.log('APPOINTMENTS: ', appointments)

    res.status(StatusCodes.OK).json({
      message: 'doctor appointments',
      appointments,
      count,
      currentPage,
      totalPages
    })
  } catch (error) {
    console.log('error fetching doctor appointments: ', error.message)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'failed to fetch appointments',
      error: error.message
    })
    throw error
  }
}

exports.viewAppointment = async (req, res) => {
  try {
    const { id } = req.params
    const doctorId = req.user.id

    if (!doctorId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Unauthorized access. Please log in.' })
    }

    const appointment = await Appointment.findOne({
      _id: id,
      doctorId
    })
      .populate(
        'doctorId',
        '_id email name specialization department schedules'
      )
      .populate('patientId', '_id email name')
      .populate('notifications')

    if (!appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Appointment doesn't exist or access denied"
      })
    }

    res.status(StatusCodes.OK).json({
      message: 'doctor appointment retrieved successfully',
      appointment
    })
  } catch (error) {
    console.log('error fetching doctor appointment: ', error.message)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'failed to fetch appointments',
      error: error.message
    })
    throw error
  }
}

exports.updateAppointment = async (req, res) => {
  try {
    const io = Socket.getIo()

    const { id } = req.params
    const { status } = req.body
    const doctorId = req.user.id

    const doctorName = await Doctor.findById(doctorId)
    const name = doctorName.name

    if (!doctorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Action not allowed. Authenticate account to perform action'
      })
    }

    const appointment = await Appointment.findOne({
      _id: id,
      doctorId: doctorId
    }).populate('notifications')

    if (!appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "appointment doesn't exist"
      })
    }

    appointment.status = status

    // Create a notification to send to the patient.
    const doctorNotification = new Notification({
      sender: doctorId,
      receiver: doctorId,
      type: 'appointment_status_update',
      message: `Your appointment status has been updated to ${status}`,
      appointment: appointment._id
    })
    const patientNotification = new Notification({
      sender: appointment.doctorId,
      receiver: appointment.patientId,
      type: 'appointment_status_update',
      message: `${name} updated your appointment status to "${status}"`,
      appointment: appointment._id
    })

    const [savedDoctorNotification, savedPatientNotification] =
      await Promise.all([doctorNotification.save(), patientNotification.save()])

    appointment.notifications.push(
      savedDoctorNotification._id,
      savedPatientNotification._id
    )

    // Save the updated appointment
    const updatedAppointment = await appointment.save()

    await User.findByIdAndUpdate(appointment.patientId, {
      $push: { notifications: savedPatientNotification }
    })
    await Doctor.findByIdAndUpdate(doctorId, {
      $push: { notifications: savedDoctorNotification }
    })

    // Emit notifications for doctor and patient.
    io.emit('new-notification', savedDoctorNotification)
    io.emit('new-notification', savedPatientNotification)

    res.status(StatusCodes.OK).json({
      message: 'patient appointment update success',
      updatedAppointment,
      savedDoctorNotification,
      savedPatientNotification
    })
  } catch (error) {
    console.log(error.message)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to update appointment',
      error: error.message
    })
    throw error.message
  }
}
