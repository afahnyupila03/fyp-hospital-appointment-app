const express = require('express')

const authRoute = require('./authRoute')
const appointmentRoute = require('./appointmentRoute')

const router = express.Router()

authRoute(router)
appointmentRoute(router)

module.exports = router;