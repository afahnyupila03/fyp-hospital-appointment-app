const express = require("express");
const router = express.Router()

const {viewAppointments, viewAppointment, updateAppointment} = require('../../controller/Doctor/appointmentController')
const {auth, restrictTo} = require('../../middlewares/auth')

router.get('/view-appointments', auth,  restrictTo("doctor"), viewAppointments)
router.get('/view-appointment/:id', auth, restrictTo("doctor"), viewAppointment)
router.put('/update-appointment/:id', auth, restrictTo("doctor"), updateAppointment)


module.exports = router
