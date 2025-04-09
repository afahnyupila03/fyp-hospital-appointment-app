// const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bodyParser = require('body-parser')

const mongoose = require('mongoose')
const { createServer } = require('http')
const { Server } = require('socket.io')
const Socket = require('./socket')
/* 
const adminAuthRoutes = require('./routes/admin/route')

const patientAuthRoutes = require('./routes/auth/user')
const doctorAuthRoutes = require('./routes/auth/doctor')

const patientAppointments = require('./routes/appointment/user')
const doctorAppointment = require('./routes/appointment/doctor') */

const app = express()

const httpServer = createServer(app)
// Init socket.io
Socket.init(httpServer)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())

// CORS Middleware.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

/* // Admin auth route registration
app.use('/admin', adminAuthRoutes)

// Auth route registration.
app.use('/patient', patientAuthRoutes)
app.use('/doctor', doctorAuthRoutes)

// Appointment router registration
app.use('/patient', patientAppointments)
app.use('/doctor', doctorAppointment) */

// Test route to verify server is running
app.get('/', (req, res) => {
  res.json({ message: 'Hospital Appointment API is running!' })
})

// Catch 404 errors and return JSON response
app.use(function (req, res, next) {
  res.status(404).json({ message: 'Route not found' })
  // next(createError(404, 'Route not found'))
})

// Error handler returning JSON instead of rendering a view
app.use(function (err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: req.app.get('env') === 'development' ? err : {}
  })
})

// MongoDB connection & start server
const URL =
  'mongodb+srv://fulopila9:9qVjS5mTfmDVn2G2@cluster0.9mx0z.mongodb.net/CareConnect'

mongoose
  .connect(URL)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB')
    httpServer.listen(4000, () => {
      const io = Socket.getIo()
      io.on('connection', socket => {
        console.log('Socket: ', socket)
        console.log('Client connected')
      })
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
  })

module.exports = app
