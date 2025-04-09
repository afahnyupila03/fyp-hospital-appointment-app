const express = require('express')
const router = express.Router()

const {
  register,
  login,
  getUser,
  logout
} = require('../../controller/auth/doctor')
const { doctorAuth } = require('../../middlewares/auth')

router.post('/register', register)
router.post('/login', login)
router.get('/', doctorAuth, getUser)
router.post('/logout', doctorAuth, logout)

module.exports = router
