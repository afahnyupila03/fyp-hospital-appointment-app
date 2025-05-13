const { StatusCodes } = require('http-status-codes')

const Appointment = require('../../models/appointment')
const User = require('../../models/user')
const Doctor = require('../../models/doctor')
const Notification = require('../../models/notification')

exports.viewAppointments = async (req, res) => {
  try {
    const user = req.user

    const appointments = await Appointment.find({ patientId: user.id })
      .populate('patientId', 'email name reason notes')
      .populate('doctorId', 'email name specialization department')
      .sort({ createdAt: -1 })

    if (!appointments) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Error find patient appointments'
      })
    }

    res.status(StatusCodes.OK).json({
      message: 'viewing all patient appointments',
      appointments
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error loading all your appointments',
      error: error.message
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
      error: error.message
    })
  }
}

exports.createAppointment = async (req, res) => {
  try {
    const patientId = req.user.id
    const { date, timeSlot, reason, doctor, notes } = req.body

    const doc = await Doctor.findOne({ name: doctor })
    if (!doc) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'selected doctor does not exist'
      })
    }
    const doctorId = doc._id

    const user = await User.findOne({ _id: patientId })

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

    // Push appointment to both patient and doctor.
    user.appointments.push(createdAppointment)
    doc.appointments.push(createdAppointment)

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
    doc.notifications.push(savedDoctorNotification._id)
    createdAppointment.notifications.push(savedPatientNotification._id)
    createdAppointment.notifications.push(savedDoctorNotification._id)

    // save created appointment to db.
    await user.save()
    await doc.save()
    const appointment = await createdAppointment.save()

    res.status(StatusCodes.CREATED).json({
      message: 'appointment create success',
      appointment,
      savedDoctorNotification,
      savedPatientNotification
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error creating patient appointment',
      error: error.message
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

    appointment.notifications.push(savedPatientNotification._id)
    appointment.notifications.push(savedDoctorNotification._id)
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
      error: error.message
    })
  }
}

exports.viewDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate()

    if (!doctors || doctors.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'no doctors found in db.'
      })
    }

    res.status(StatusCodes.OK).json({
      message: 'patient viewing all doctors',
      doctors
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error finding doctors',
      error: error.message
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
      error: error.message
    })
  }
}
