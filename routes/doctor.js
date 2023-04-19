const express = require('express')
const {
    getDoctorInfoController,
    updateProfileController,
    getDoctorByIdController,
    doctorAppointmentsController,
    updateStatusController
} = require('../controllers/doctor')
const auth = require('../middlewares/auth')
const router = express.Router()

router.post('/getDoctorInfo', auth, getDoctorInfoController)

router.post('/updateProfile', auth, updateProfileController)

router.post('/getDoctorById', auth, getDoctorByIdController)

router.get('/doctor-appointments', auth, doctorAppointmentsController)

router.post('/update-status', auth, updateStatusController)

module.exports = router