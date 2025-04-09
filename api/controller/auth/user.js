const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { StatusCodes } = require('http-status-codes')
const mongoose = require('mongoose')

const User = require('../../models/user')
const Logout = require('../../models/logout')

exports.registerUser = async (req, res) => {
  try {
    const { email, name, password } = req.body

    const hashPassword = await bcrypt.hash(password, 12)

    const createdUser = new User({
      name: name,
      email: email,
      password: hashPassword
    })

    const user = await createdUser.save()

    const token = jwt.sign(
      {
        email: email,
        userId: user._id
      },
      'patientToken',
      {
        expiresIn: '2hr'
      }
    )

    res.status(201).json({
      message: 'patient account create success',
      token: token,
      user: user
    })
  } catch (error) {
    console.error('patient registration account error: ', error)
    res.status(400).json({
      message: 'patient registration account error',
      error: error
    })
    throw error
  }
}

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'No user with this email exists. Please create an account.'
      })
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: 'Incorrect password. Please try again.' })
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString()
      },
      'patientToken', // Replace with a secure environment variable in production
      { expiresIn: '2h' }
    )

    // Send Response
    res.status(200).json({
      message: 'Patient account login successful',
      token,
      user
    })
  } catch (error) {
    console.error('Patient login failed:', error.message)
    res.status(500).json({
      message: 'Patient login failed. Please try again later.',
      error: error.message
    })
  }
}

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid patient ID pp' })
    }
    const user = await User.findById(id)

    if (!user) {
      return res.status(401).json({ message: 'User not found.' })
    }

    const authHeader = req.get('Authorization')
    console.log('Auth header :', authHeader)
    if (!authHeader) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Patient not authenticated.' })
    }

    const token = authHeader.split(' ')[1]

    res.status(200).json({ message: 'patient account', user: user, token })
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error find user account', error: error.message })
  }
}

exports.logoutUser = async (req, res) => {
  try {
    const authHeader = req.get('Authorization')
    console.log('Auth Header:', authHeader)
    if (!authHeader) {
      return res.status(401).json({ message: 'Patient not authenticated.' })
    }

    const token = authHeader.split(' ')[1]
    console.log('toke: ', token)
    if (!token) {
      return res.status(401).json({ message: 'Token is missing.' })
    }

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
      decodedToken = jwt.verify(token, 'patientToken')
      console.log('Decoded token:', decodedToken)
    } catch (err) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: 'Invalid or expired token.' })
    }

    // Blacklist token
    const result = await Logout.create({ token })
    console.log('Token blacklisted successfully:', result)

    return res
      .status(StatusCodes.CREATED)
      .json({ message: 'Patient account logout success', token: result })
  } catch (error) {
    console.log('Logout error:', error.message)
    return res
      .status(500)
      .json({ message: 'Logout failed.', error: error.message })
  }
}
