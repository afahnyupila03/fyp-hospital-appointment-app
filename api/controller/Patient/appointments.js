const { StatusCodes } = require('http-status-codes')

const Appointment = require('../../models/appointment')
const User = require('../../models/user')
const Doctor = require('../../models/doctor')
const Notification = require('../../models/notification')
const socket = require('../../socket')

exports.viewAppointments = async (req, res) => {
  try {
    const patientId = req.user.id
    const { page, limit } = req.query

    if (!patientId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message:
          'Unauthorized access, please authenticate account to perform action.'
      })
    }

    const appointments = await Appointment.find({ patientId })
      .populate('patientId', 'email name reason notes')
      .populate('doctorId', 'email name specialization department')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit)

    const count = await Appointment.find({ patientId }).countDocuments()
    const totalPages = Math.ceil(count / limit)
    const currentPage = parseInt(page)

    if (!appointments || appointments.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No booked appointments'
      })
    }

    res.status(StatusCodes.OK).json({
      message: 'viewing all patient appointments',
      appointments,
      count,
      totalPages,
      currentPage
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error loading all your appointments',
      error: error
    })
  }
}

exports.viewAppointment = async (req, res) => {
  try {
    const user = req.user
    const { id } = req.params

    let query = { _id: id }

    if (user.role === 'patient') {
      query.patientId = user.id
    }

    const appointment = await Appointment.findOne(query)
      .populate('doctorId', 'email name specialization department')
      .populate('patientId', 'email name reason notes')

    if (!appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Error, could not find appointment'
      })
    }

    res.status(StatusCodes.OK).json({
      message: 'patient appointment load success',
      appointment
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error loading patient appointment',
      error: error
    })
  }
}

exports.createAppointment = async (req, res) => {
  try {
    const io = socket.getIo()

    const patientId = req.user.id
    const user = await User.findById(patientId)
    const { date, timeSlot, reason, doctor, notes } = req.body

    const doc = await Doctor.findOne({ name: doctor })
    if (!doc) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'selected doctor does not exist'
      })
    }
    const doctorId = doc._id

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'patient not found, please login or create account to continue'
      })
    }

    const createdAppointment = await Appointment({
      patientId,
      doctorId,
      date,
      timeSlot,
      reason,
      notes
    })

    const appointment = await createdAppointment.save()

    // Push appointment to both patient and doctor.
    user.appointments.push(appointment._id)
    doc.appointments.push(appointment._id)

    // create notification and push notification.
    // Doctor notification.
    const doctorNotification = new Notification({
      sender: patientId,
      receiver: doctorId,
      type: 'appointment_request',
      message: `Appointment request from patient ${patientId.name}.`,
      appointment: createdAppointment._id
    })
    // Patient notification.
    const patientNotification = new Notification({
      sender: patientId,
      receiver: patientId,
      type: 'appointment_request',
      message: `Appointment request sent to Doctor ${doctorId.name}.`,
      appointment: createdAppointment._id
    })

    const [savedDoctorNotification, savedPatientNotification] =
      await Promise.all([doctorNotification.save(), patientNotification.save()])

    // Push notifications ref to patient, doctor and appointment.
    user.notifications.push(savedPatientNotification._id)
    user.markModified('notifications')
    await user.save()

    doc.notifications.push(savedDoctorNotification._id)
    doc.markModified('notifications')
    await doc.save()

    appointment.notifications.push(
      savedPatientNotification._id,
      savedDoctorNotification._id
    )

    // save created appointment to db.

    // Emit doctor & patient notifications.
    io.emit('new-notification', savedDoctorNotification)
    io.emit('new-notification', savedPatientNotification)

    res.status(StatusCodes.CREATED).json({
      message: 'appointment create success',
      appointment,
      savedDoctorNotification,
      savedPatientNotification
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating patient appointment',
      error: error
    })
  }
}

exports.updateAppointment = async (req, res) => {
  try {
    const user = req.user.id
    const { doctor, date, timeSlot, reason, notes } = req.body
    const { id } = req.params

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'No user found, please authenticate account to perform action.'
      })
    }

    const appointment = await Appointment.findById(id).populate(
      'notifications',
      'sender receiver type message appointment status'
    )
    if (!appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'appointment does not exist'
      })
    }

    // Handle doctor change
    let newDoctor
    if (doctor) {
      newDoctor = await Doctor.findOne({ name: doctor })
      if (!newDoctor) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: 'No doctor found'
        })
      }

      const oldDoctorId = appointment.doctorId.toString()
      const newDoctorId = newDoctor._id.toString()

      if (oldDoctorId !== newDoctorId) {
        await Doctor.findByIdAndUpdate(oldDoctorId, {
          $pull: { appointments: appointment._id }
        })

        await Doctor.findByIdAndUpdate(newDoctorId, {
          $addToSet: { appointments: appointment._id }
        })

        appointment.doctorId = newDoctorId
      }
    }

    // Update fields
    if (date) appointment.date = date
    if (timeSlot) appointment.timeSlot = timeSlot
    if (reason) appointment.reason = reason
    if (notes) appointment.notes = notes

    appointment.notifications.push(
      savedPatientNotification._id,
      savedDoctorNotification._id
    )

    const updatedAppointment = await appointment.save()

    // Create and push notification for doctor and patient.
    const patientNotification = new Notification({
      sender: user,
      receiver: user,
      type: newDoctor ? 'appointment_request' : 'appointment_request_update',
      message: newDoctor
        ? `Appointment request sent.`
        : `Appointment request updated.`,
      appointment: updatedAppointment._id
    })
    const doctorNotification = new Notification({
      sender: user,
      receiver: updatedAppointment.doctorId,
      type: newDoctor ? 'appointment_request' : 'appointment_request_update',
      message: newDoctor
        ? `Appointment request from ${updatedAppointment.patientId.name}.`
        : `Appointment request update by ${updatedAppointment.patientId.name}.`,
      appointment: updatedAppointment._id
    })

    const [savedDoctorNotification, savedPatientNotification] =
      await Promise.all([patientNotification.save(), doctorNotification.save()])

    await User.findByIdAndUpdate(user.id, {
      $addToSet: { notifications: savedPatientNotification._id }
    })
    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      $addToSet: { notifications: savedDoctorNotification._id }
    })

    // Emit doctor & patient notifications.
    io.emit('new-notification', savedDoctorNotification)
    io.emit('new-notification', savedPatientNotification)

    await appointment.save()

    res.status(StatusCodes.CREATED).json({
      message: 'appointment updated',
      updatedAppointment,
      savedDoctorNotification,
      savedPatientNotification
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error updating patient appointment',
      error: error
    })
  }
}

exports.viewDoctors = async (req, res) => {
  try {
    const patientId = req.user.id
    const { page, limit } = req.query

    if (!patientId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Unauthorized action. Authenticate account to perform action.'
      })
    }

    const doctors = await Doctor.find()
      .populate('schedules')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    if (!doctors || doctors.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'No doctors registered at the moment.'
      })
    }

    const count = await Doctor.find().estimatedDocumentCount()
    const totalPages = Math.ceil(count / limit)
    const currentPage = parseInt(page)

    res.status(StatusCodes.OK).json({
      message: 'patient viewing all doctors',
      doctors,
      count,
      totalPages,
      currentPage
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error finding doctors',
      error: error
    })
  }
}

exports.viewDoctor = async (req, res) => {
  try {
    const { id } = req.params

    const doctor = await Doctor.findOne({ _id: id })

    if (!doctor) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'doctor profile not found'
      })
    }

    res.status(StatusCodes.OK).json({
      message: 'patient doctor profile',
      doctor
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'error viewing doctor profile',
      error: error
    })
  }
}
