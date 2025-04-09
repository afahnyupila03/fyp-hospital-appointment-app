
const express = require('express')

const router = express.Router()

const {viewAppointments, viewAppointment, updateAppointment} = require('../../controller/appointments/doctor')

router.get('/appointments', viewAppointments)
router.get('/appointments/:id', viewAppointment)
router.put('/appointment/update/:id', updateAppointment)

module.exports = router