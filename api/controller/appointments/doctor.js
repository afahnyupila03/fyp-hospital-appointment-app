const { StatusCodes } = require('http-status-codes')

const Appointment = require('../../models/doctor')
const Doctor = require('../../models/doctor')

exports.viewAppointments = async (req, res) => {
  try {
    const doctorId = req.userId

    const appointments = await Appointment.find({ doctorId: doctorId })
      .populate('patientId', 'email name reason notes')
      .populate('doctorId', 'name email specialty')
      .sort({ createdAt: -1 })

    res.status(StatusCodes.OK).json({
      message: 'doctor appointments',
      appointments
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
    const doctorId = req.userId

    if (!doctorId)
      res.status(401).json({ message: 'Unauthorized access. Please log in.' })

    const appointment = await Appointment.findById({
      _id: id,
      doctorId: doctorId
    })
      .populate('doctorId', 'name specialty')
      .populate('patientId', 'name reason notes')

    if (!appointment)
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Appointment doesn't exist"
      })

    res.status(StatusCodes.OK).json({
      message: 'doctor appointment',
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
    const { id } = req.params
    const { status } = req.body
    const doctorId = req.userId

    const appointment = await Appointment.findByIdAndUpdate({
      _id: id,
      doctorId: doctorId
    })

    if (!appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "appointment doesn't exist"
      })
    }

    appointment.status = status

    const updatedAppointment = appointment.save()

    res.status(StatusCodes.OK).json({
      message: 'patient appointment update success',
      updatedAppointment
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
