const { StatusCodes } = require('http-status-codes')

const mongoose = require('mongoose')

const Appointment = require('../../models/appointment')
const User = require('../../models/user')
const Doctor = require('../../models/doctor')

exports.viewAppointments = async (req, res) => {
  try {
    const userId = req.userId
    console.log(userId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID', error: userId })
    }

    const appointments = await Appointment.find({ patientId: userId })
      .populate('patientId', 'name email reason notes')
      .populate('doctorId', 'name email specialty')
      .sort({ createdAt: -1 })

    res.status(StatusCodes.OK).json({
      message: 'patient appointments',
      appointments
    })
  } catch (error) {
    console.log('Error fetching patient appointments: ', error.message)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to fetch appointments',

      error: error.message
    })
  }
}

exports.viewAppointment = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.userId

    if (!userId) {
      return res
        .status(401)
        .json({ message: 'Unauthorized access. Please log in.' })
    }

    const appointment = await Appointment.findById({
      _id: id,
      patientId: userId
    })
      .populate('doctorId', 'name specialty')
      .populate('patientId', 'name email')

    if (!appointment)
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Appointment doesn't exist"
      })

    res.status(StatusCodes.OK).json({
      message: 'patient appointment',
      appointment
    })
  } catch (error) {
    console.log('Error fetching specific appointment: ', error.message)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Failed to retrieve appointment',
      error: error.message
    })
  }
}

exports.createAppointment = async (req, res) => {
  try {
    const { date, timeSlot, reason, doctor, notes } = req.body
    const userId = req.userId

    // Check is userId is valid (objectId)
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Invalid user ID'
      })
    }

    const doc = await Doctor.findOne({ name: doctor })

    if (!doc) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          'The selected doctor is not available at this hospital. Please verify the name and try again.'
      })
    }

    const docId = doc._id

    const user = await User.findById(userId)
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'User not found'
      })
    }

    const createdAppointment = new Appointment({
      patientId: userId,
      doctorId: docId,
      reason,
      date,
      timeSlot,
      notes
    })

    user.appointments.push(createdAppointment._id)
    await user.save()

    const appointment = await createdAppointment.save()

    res.status(StatusCodes.CREATED).json({
      message: 'appointment created',
      user,
      appointment
    })
  } catch (error) {
    console.log('error creating appointment: ', error.message)
    res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Failed to create appointment',
      error: error.message
    })
  }
}

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params
    const { doctor, date, timeSlot, reason } = req.body

    const doc = await Doctor.findOne({ name: doctor })

    if (!doc)
      res.status(StatusCodes.BAD_REQUEST).json({
        message:
          'The selected doctor is not available at this hospital. Please verify the name and try again.'
      })

    let doctorId = doc._id

    const patientId = req.userId
    const user = await User.findById(patientId)

    const appointment = await Appointment.findById({
      _id: id,
      patientId
    })

    if (!appointment) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: 'Unauthorized user. Please login to view appointment'
      })
    }

    appointment.doctorId = doctorId
    appointment.date = date
    appointment.timeSlot = timeSlot
    appointment.reason = reason

    const result = await appointment.save()
    console.log('Update appointment: ', result)

    res.status(StatusCodes.OK).json({
      message: 'patient appointment update success',
      data: result
    })
  } catch (error) {
    console.log('error updating appointment: ', error.message)
    res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Failed to update appointment',
      error: error.message
    })
  }
}

exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params
    const patientId = req.userId

    const user = await User.findById(patientId)

    const appointment = await Appointment.findByIdAndDelete({ _id: id, patientId })
    if (!appointment)
      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'patient appointment to be deleted not found' })

    const deletedAppointment = appointment.deleteOne()

    user.appointments.pull(appointment._id)
    await user.save()

    res.status(StatusCodes.OK).json({
      message: 'patient appointment deleted.',
    })
  } catch (error) {
    console.log('error deleting appointment: ', error.message)
    res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Failed to delete appointment',
      error: error.message
    })
  }
}
