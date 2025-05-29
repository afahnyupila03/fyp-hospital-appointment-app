const User = require('../../models/user')

const { StatusCodes } = require('http-status-codes')

exports.viewPatients = async (req, res) => {
  try {
    const adminId = req.user.id

    const { page, limit } = req.query

    if (!adminId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Please authenticate account to perform action' })
    }

    const patients = await User.find()
      .select('-password')
      .sort({
        createdAt: -1
      })
      .limit(parseInt(limit))
      .skip((page - 1) * limit)

    if (!patients) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Error, patients not found'
      })
    }

    const count = await User.find().countDocuments()
    const totalPages = Math.ceil(count / limit)
    const currentPage = parseInt(page)

    res.status(StatusCodes.OK).json({
      message: 'viewing patients',
      patients,
      count,
      currentPage,
      totalPages
    })
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error viewing all patients',
      error: error.message
    })
  }
}

exports.viewPatient = async (req, res) => {
  try {
    const adminId = req.user.id

    if (!adminId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Please authenticate account to perform action' })
    }

    const { id } = req.params
    const patient = await User.findById({ _id: id })
      .select('-password')
      .populate('appointments')
    if (!patient) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Error, patient not found'
      })
    }

    return res.status(StatusCodes.OK).json({
      message: 'patient account',
      patient
    })
  } catch (error) {
    console.error(error.message)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error viewing patient account',
      error: error.message
    })
  }
}

exports.archivePatient = async (req, res) => {
  try {
    const adminId = req.user.id

    if (!adminId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Please authenticate account to perform action' })
    }

    const { id } = req.params
    const { isActive } = req.body

    const patient = await User.findById(id)

    if (!patient) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No patient with id exist.'
      })
    }

    patient.isActive = isActive
    patient.terminatedAt = new Date()

    await patient.save()

    res.status(StatusCodes.CREATED).json({
      message: 'Success archiving patient profile',
      patient
    })
  } catch (error) {
    console.error('error archive patient: ', error.message)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error archiving patient profile',
      error: error.message
    })
  }
}

exports.unarchivePatient = async (req, res) => {
  try {
    const adminId = req.user.id

    if (!adminId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Please authenticate account to perform action' })
    }

    const { id } = req.params
    const { isActive } = req.body

    const patient = await User.findById(id)

    if (!patient) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No patient with id exist.'
      })
    }

    patient.isActive = isActive
    patient.terminatedAt = null

    await patient.save()

    res.status(StatusCodes.CREATED).json({
      message: 'Success archiving patient profile',
      patient
    })
  } catch (error) {
    console.error('error un-archive patient: ', error.message)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error archiving patient profile',
      error: error.message
    })
  }
}
