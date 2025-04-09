
const express = require('express')
const router = express.Router()

const {auth, restrictTo} = require('../../middlewares/auth')
const {viewPatients, viewPatient} = require('../../controller/Admin/patientManagementController')

router.get('/view-patients', auth, restrictTo("admin"), viewPatients)
router.get('/view-patient/:id', auth, restrictTo("admin"), viewPatient)

module.exports = router