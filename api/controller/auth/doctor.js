const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const { StatusCodes } = require('http-status-codes')

const Doctor = require('../../models/doctor')

exports.register = async (req, res) => {
  try {
    const { email, password, name, specialty } = req.body

    const hashPassword = await bcrypt.hash(password, 12)

    const createdDoctor = await Doctor({
      name,
      email,
      specialty,
      password: hashPassword
    })

    const doctor = await createdDoctor.save()

    const token = jwt.sign(
      {
        email: email,
        userId: doctor._id
      },
      'doctorToken',
      { expiresIn: '2hr' }
    )

    res.status(201).json({
      message: 'doctor account create success',
      user: doctor,
      token: token
    })
  } catch (error) {
    res.status(400).json({
      message: 'create doctor account failed',
      error: error
    })
    throw error
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await Doctor.findOne({ email })
    if (!user) res.status(401).json({ message: 'no account with email exist.' })

    const token = jwt.sign(
      {
        email,
        userId: user._id
      },
      'doctorToken',
      { expiresIn: '2hr' }
    )

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword)
      res
        .status(401)
        .json({ message: 'Wrong password, please enter valid password.' })

    res.status(200).json({ message: 'doctor login success', user, token })
  } catch (error) {
    console.error('doctor login failed:', error.message)
    res.status(500).json({
      message: 'doctor login failed. Please try again later.',
      error: error.message
    })
  }
}

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params
    const user = await Doctor.findById({ _id: id })

    if (!user) res.status(401).json({ message: 'User not found.' })

    const authHeader = req.get('Authorization')
    console.log('Auth header :', authHeader)
    if (!authHeader)
      res.status(401).json({ message: 'Doctor not authenticated.' })

    const token = authHeader.split(' ')[1]

    res.status(200).json({ message: 'patient account', user: user, token })
  } catch (error) {
    res.status(500).json({ message: 'Error find user account', error: error })
  }
}

exports.logout = async (req, res) => {
  try {
    const authHeader = req.get('Authorization')
    console.log('Auth header :', authHeader)
    if (!authHeader)
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Doctor not authenticated.' })

    const token = authHeader.split(' ')[1]

    if (!token)
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Token is missing.' })

    // Check if token is already blacklisted
    const blacklisted = await Logout.findOne({ token })
    if (blacklisted) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Token blacklisted. Please login again.' })
    }

    // Verify the token before blacklisting
    let decodedToken
    try {
      decodedToken = jwt.verify(token, 'doctorToken')
      console.log('Decoded token:', decodedToken)
    } catch (error) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Invalid or expired token.' })
    }

    // Blacklist token
    const result = await Logout.create({ token })
    console.log('Token blacklisted successfully:', result)

    return res
      .status(StatusCodes.CREATED)
      .json({ message: 'Doctor account logout success', token: result })
  } catch (error) {
    console.log('Logout error: ', error.message)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Logout failed',
      error: error.message
    })
  }
}
