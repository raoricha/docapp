const doctorModel = require("../models/doctor")
const userModel = require('../models/user')

const getAllUsersController = async (request, response) => {
    try {
        const users = await userModel.find({})
        response.status(200).send({
            success: true,
            message: "users data",
            data: users
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            message: 'error while fetching users',
            error
        })
    }
}

const getAllDoctorsController = async (request, response) => {
    try {
        const doctors = await doctorModel.find({})
        response.status(200).send({
            success: true,
            message: "doctors data",
            data: doctors
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            message: 'error while fetching doctors',
            error
        })
    }
}

const changeAccountStatusController = async (request, response) => {
    try {
        const { doctorId, status } = request.body
        const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status })
        const user = await userModel.findOne({ _id: doctor.userId })
        const notification = user.notification
        notification.push({
            type: 'doctor-account-request-updated',
            message: `your doctor account request has ${status}`,
            onClickPath: '/notification'
        })
        user.isDoctor = status === 'approved' ? true : false
        await user.save()
        response.status(201).send({
            success: true,
            message: 'Account status updated',
            data: doctor
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            message: 'Error in account status',
            error
        })
    }
}

module.exports = {
    getAllDoctorsController,
    getAllUsersController,
    changeAccountStatusController,
}