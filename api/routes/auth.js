const express = require('express')

const router = express.Router()

router.post('/register')
router.post('/login')
router.get('/profile')
router.get('/logout')

module.export = router