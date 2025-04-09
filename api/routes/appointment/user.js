const express = require('express')

const router = express.Router()

const { userAuth } = require('../../middlewares/auth')

const validator = require('../../validators/appointment/user')

const {
  createAppointment,
  viewAppointment,
  viewAppointments,
  updateAppointment,
  deleteAppointment
} = require('../../controller/appointments/user')

router.post(
  '/create-appointment',
  userAuth,
  validator.createAppointmentValidator,
  createAppointment
)
router.get('/appointments', userAuth, viewAppointments)
router.get('/appointment/:id', userAuth, viewAppointment)
router.put(
  '/appointment/update/:id',
  userAuth,
  validator.updateAppointmentValidator,
  updateAppointment
)
router.delete('/appointment/delete/:id', userAuth, deleteAppointment)

module.exports = router
