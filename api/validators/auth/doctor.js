const { body, validationResult } = require('express-validator')
const { StatusCodes } = require('http-status-codes')

const Doctor = require('../../models/doctor')

exports.registerValidator = [
  body('name')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Name must be at least 6 characters'),

  body('email')
    .isEmail()
    .withMessage('Please enter valid email')
    .custom(async (value, { req }) => {
      try {
        const user = await Doctor.findOne({ email: value })
        if (user) Promise.reject('Account with email exist.')
      } catch (error) {
        res.status(StatusCodes.FORBIDDEN).json({
          message: 'Account with email exist',
          error: error.message
        })
      }
    })
    .normalizeEmail(),

  body('specialty').trim().withMessage('Please enter a specialty.'),

  body('password')
    .trim()
    .isLength({ min: 6 })
    .isStrongPassword()
    .withMessage('Password must be at least 6 characters long'),

  (req, res, next) => {
    const errors = validationResult(req)
    console.log(
      'error message: ',
      errors.array().map(msg => msg.msg)
    )
    if (!errors.isEmpty()) {
      const errorMsg = errors.array()

      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Failed to register account',
        error: errorMsg
      })
    }

    next()
  }
]

exports.loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      const errorMessage = errors.array()
      console.log(
        'error message: ',
        errors.array().map(msg => msg.msg)
      )
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Login failed',
        error: errorMessage
      })
    }
    next()
  }
]
