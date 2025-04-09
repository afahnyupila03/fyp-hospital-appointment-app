const express = require('express')

const router = express.Router()

const {
  registerUser,
  loginUser,
  logoutUser,
  getUser
} = require('../../controller/auth/user')

const {
  registerValidator,
  loginValidator
} = require('../../validators/auth/user')

const { userAuth } = require('../../middlewares/auth')

router.post('/register', registerValidator, registerUser)
router.post('/login', loginValidator, loginUser)
router.get('/profile/:id', userAuth, getUser)
router.post('/logout', userAuth, logoutUser)

module.exports = router
