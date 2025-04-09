const { validationResult, body } = require('express-validator')
const { StatusCodes } = require('http-status-codes')

exports.registerValidator = [
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
      const errorMessage = errors.array().map(msg => msg.msg)
      console.log(
        'error message: ',
        errors.array().map(msg => msg.msg)
      )
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          message: 'Register failed',
          error: errorMessage
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
      const errorMessage = errors.array().map(msg => msg.msg)
      console.log(
        'error message: ',
        errors.array().map(msg => msg.msg)
      )
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({
          message: 'Login failed',
          error: errorMessage
        })
    }
    next()
  }
]
