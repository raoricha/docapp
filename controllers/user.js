const userModel = require('../models/user')
const doctorModel = require('../models/doctor')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const appointmentModel = require('../models/appointment')
const moment = require('moment')
const { response, request } = require('express')

const registerController = async (request, response) => {
    try {
        const existingUser = await userModel.findOne({ email: request.body.email })
        if (existingUser) {
            return response.status(200).send({ message: 'User already exists', success: false })
        }
        const password = request.body.password
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)
        request.body.password = hashPassword
        const newUser = new userModel(request.body)
        await newUser.save()
        response.status(201).send({ message: 'Registeration successfull', success: true })
    } catch (error) {
        console.log(error)
        response.status(500).send({ success: false, message: `Registeration is failed due to error ${error.message}`.bgRed.white })
    }
}

const loginController = async (request, response) => {
    try {
        const user = await userModel.findOne({ email: request.body.email })
        if (!user) {
            return response.status(200).send({ message: `user not found`, success: false })
        }
        const isMatch = await bcrypt.compare(request.body.password, user.password)
        if (!isMatch) {
            return response.status(200).send({ message: `invalid data`, success: false })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        response.status(200).send({ message: "Login Success", success: true, token })
    } catch (error) {
        console.log(error)
        response.status(500).send({ message: `Error in login ${error.message}` })
    }
}

const authController = async (request, response) => {
    try {
        const user = await userModel.findById({ _id: request.body.userId })
        user.password = undefined
        if (!user) {
            return response.status(200).send({
                message: 'user not found',
                success: false
            })
        } else {
            response.status(200).send({
                success: true,
                data: user
            })
        }
    } catch (error) {
        console.log(error)
        response.status(500).send({
            message: 'auth error',
            success: false,
            error
        })
    }
}

const applyDoctorController = async (request, response) => {
    try {
        const newDoctor = await doctorModel({ ...request.body, status: 'pending' })
        await newDoctor.save()
        const adminUser = await userModel.findOne({ isAdmin: true })
        const notification = adminUser.notification
        notification.push({
            type: 'apply-doctor-request',
            message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for doctor account`,
            data: {
                doctorId: newDoctor._id,
                name: newDoctor.firstName + " " + newDoctor.lastName,
                onClickPath: '/admin/doctors'
            },
        })
        await userModel.findByIdAndUpdate(adminUser._id, { notification })
        response.status(201).send({
            success: true,
            message: 'Applied for doctor successfully'
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            error,
            message: 'Error while applying for doctor'
        })
    }
}

const getAllNotificationController = async (request, response) => {
    try {
        const user = await userModel.findOne({ _id: request.body.userId })
        const seennotification = user.seennotification
        const notification = user.notification
        seennotification.push(...notification)
        user.notification = []
        user.seennotification = notification
        const updateUser = await user.save()
        response.status(200).send({
            success: true,
            message: "all notifications marked as read",
            data: updateUser,
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            message: 'Error in notification',
            success: false,
            error,
        })
    }
}

const deleteAllNotificationController = async (request, response) => {
    try {
        const user = await userModel.findOne({ _id: request.body.userId })
        user.notification = []
        user.seennotification = []
        const updatedUser = await user.save()
        updatedUser.password = undefined
        response.status(200).send({
            success: true,
            message: "Notification deleted successfully",
            data: updatedUser,
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            message: 'unable to delete all notification',
            error
        })
    }

}

const getAllDoctorsController = async (request, response) => {
    try {
        const doctors = await doctorModel.find({ status: 'approved' })
        response.status(200).send({
            success: true,
            message: 'Doctors List fetched successfully',
            data: doctors
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            error,
            message: 'Error while fetching doctors'
        })
    }
}

const bookAppointmentController = async (request, response) => {
    try {
        request.body.date = moment(request.body.date, 'DD-MM-YYYY').toISOString()
        request.body.time = moment(request.body.time, "HH:mm").toISOString()
        request.body.status = "pending"
        const newAppointment = new appointmentModel(request.body)
        await newAppointment.save()
        const user = await userModel.findOne({ _id: request.body.doctorInfo.userId })
        user.notification.push({
            type: 'New-appointment-request',
            message: `A new appointment request from ${request.body.userInfo.name}`,
            onClickPath: '/user/appointments'
        })
        await user.save()
        response.status(200).send({
            success: true,
            message: 'Appointment book succesfully'
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            error,
            message: 'Error booking appointment'
        })
    }
}

const checkingAvailabilityController = async (request, response) => {
    try {
        const date = moment(request.body.date, 'DD-MM-YYYY').toISOString()
        const fromTime = moment(request.body.time, 'HH:mm').subtract(1, 'hours').toISOString()
        const toTime = moment(request.body.time, 'HH:mm').add(1, 'hours').toISOString()
        const doctorId = request.body.doctorId
        const appointments = await appointmentModel.find({
            doctorId,
            date,
            time: {
                $gte: fromTime,
                $lte: toTime
            }
        })
        if (appointments.length > 0) {
            return response.status(200).send({
                message: 'Appointments not available at this time',
                success: true
            })
        } else {
            return response.status(200).send({
                message: 'Appointments available',
                success: true
            })
        }
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            error,
            message: 'Error checking availability'
        })
    }
}

const userAppointmentsController = async (request, response) => {
    try {
        const appointments = await appointmentModel.find({
            userId: request.body.userId,
        })
        response.status(200).send({
            success: true,
            message: 'Users Appointments fetch successfully',
            data: appointments
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            error,
            message: 'Error in User Appointments'
        })
    }
}

module.exports = {
    loginController,
    registerController,
    authController,
    applyDoctorController,
    getAllNotificationController,
    deleteAllNotificationController,
    getAllDoctorsController,
    bookAppointmentController,
    checkingAvailabilityController,
    userAppointmentsController
}