const mongoose = require('mongoose')
const colors = require('colors')

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log(`MongoDB connected to ${mongoose.connection.host}`.bgGreen.white)
    } catch (error) {
        console.log(`MongoDB can't connect to the network due to ${error}`.bgRed.white)
    }
}

module.exports = connectDB