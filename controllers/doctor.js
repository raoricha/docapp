const { request, response } = require("express")
const appointmentModel = require("../models/appointment")
const doctorModel = require("../models/doctor")
const userModel = require("../models/user")

const getDoctorInfoController = async (request, response) => {
    try {
        const doctor = await doctorModel.findOne({ userId: request.body.userId })
        response.status(200).send({
            success: true,
            message: "doctor data fetch success",
            data: doctor,
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            error,
            message: "Error in fetching doctors"
        })
    }
}

const updateProfileController = async (request, response) => {
    try {
        const doctor = await doctorModel.findOneAndUpdate(
            { userId: request.body.userId },
            request.body
        )
        response.status(201).send({
            success: true,
            message: 'Doctor Profile Updated',
            data: doctor
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            message: 'Doctor Profile update issue',
            error
        })
    }
}

const getDoctorByIdController = async (request, response) => {
    try {
        const doctor = await doctorModel.findOne({ _id: request.body.doctorId })
        response.status(200).send({
            success: true,
            message: 'Single doctor info fetched',
            data: doctor
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            error,
            message: 'Error in Single doctor Info'
        })
    }
}

const doctorAppointmentsController = async (request, response) => {
    try {
        const doctor = await doctorModel.findOne({ userId: request.body.userId })
        const appointments = await appointmentModel.find({
            doctorId: doctor._id
        })
        response.status(200).send({
            success: true,
            message: 'Doctor Appointments fetch successfullly',
            data: appointments
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            error,
            message: 'Error in Doc appointments'
        })
    }
}

const updateStatusController = async (request, response) => {
    try {
        const { appointmentsId, status } = request.body
        const appointments = await appointmentModel.findByIdAndUpdate(appointmentsId, { status })
        const user = await userModel.findOne({ _id: appointmentsId.userId })
        user.notification.push({
            type: 'status-updated',
            message: `your appointment has been updated ${status}`,
            onClickPath: '/doctor-appointments'
        })
        await user.save()
        response.status(200).send({
            success: true,
            message: 'Appointment status updated'
        })
    } catch (error) {
        console.log(error)
        response.status(500).send({
            success: false,
            error,
            message: 'Error in update status'
        })
    }
}

module.exports = {
    getDoctorInfoController,
    updateProfileController,
    getDoctorByIdController,
    doctorAppointmentsController,
    updateStatusController
}