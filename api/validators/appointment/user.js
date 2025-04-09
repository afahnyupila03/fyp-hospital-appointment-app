const { body, validationResult } = require('express-validator')
const { StatusCodes } = require('http-status-codes')

exports.createAppointmentValidator = [
  body('doctor')
    .trim()
    .notEmpty()
    .withMessage('Select a doctor for appointment'),

  body('date')
    .trim()
    .notEmpty()
    .withMessage('Date is required')
    .isDate()
    .isISO8601()
    .withMessage('Date must be of format YYY-MM-DD'),

  body('timeSlot').trim().isTime().withMessage('Please time slot'),

  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Reason for appointment required'),

  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.notEmpty())
      res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation patient error: Invalid appointment data',
        error: errors
      })
    next()
  }
]

exports.updateAppointmentValidator = [
  body('doctor')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Doctor cannot be empty'),

  body('date')
    .optional()
    .trim()
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format'),

  body('timeSlot')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Time slot cannot be empty'),

  body('reason')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Reason cannot be empty'),

  (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation patient update error: Invalid update data',
        errors: errors.array()
      })
    }

    next()
  }
]
