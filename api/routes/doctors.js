
const express = require('express')

const router = express.Router()

router.get('/')
router.get('/:id')
router.post('/')
router.put('/:id')

module.exports = router;