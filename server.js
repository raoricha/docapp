const express = require('express')
const morgan = require('morgan')
const colors = require('colors')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const path = require('path')

dotenv.config()

connectDB()

// rest object
const app = express()

// middlewares
app.use(express.json())
app.use(morgan('dev'))

// app.use(cors())

// setting up routes
app.use('/api/v1/user', require('./routes/user'))
app.use('/api/v1/admin', require('./routes/admin'))
app.use('/api/v1/doctor', require('./routes/doctor'))

app.use(express.static(path.join(__dirname, './client/build')))

app.get('*', function (request, response) {
    response.sendFile(path.join(__dirname, "./client/build/index.html"))
})

const port = process.env.PORT || 3001
// listen to the port
app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_MODE} mode on the port ${process.env.PORT}`.bgBlue.cyan)
})