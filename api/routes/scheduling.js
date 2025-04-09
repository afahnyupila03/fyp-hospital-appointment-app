
const express = require('express')

const router = express.Router()

router.get('/:doctorId')
router.post('/:doctorId')
router.delete('/:doctorId/:slotId')

module.exports = router;