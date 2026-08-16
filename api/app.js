const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bodyParser = require('body-parser')

const mongoose = require('mongoose')
const { createServer } = require('http')
const { Server } = require('socket.io')
const Socket = require('./socket')
const cors = require('cors')
const dotenv = require('dotenv')

const adminRoutes = require('./routes/Admin/index')
const doctorRoutes = require('./routes/Doctor/index')
const doctorMetaRoute = require('./routes/meta')
const patientRoutes = require('./routes/Patient/index')

// InitAdmin controller.
const { initAdmin } = require('./controller/Admin/adminAuth.js')

const app = express()
dotenv.config()

const httpServer = createServer(app)

// Init socket.io
const io = Socket.init(httpServer)
app.set('io', io)

// Middlewares.
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())

// CORS.
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  })
)

// Routes.
app.use('/api/meta', doctorMetaRoute)
app.use('/admin', adminRoutes)
app.use('/doctor', doctorRoutes)
app.use('/patient', patientRoutes)

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
mongoose
  .connect(process.env.MONGODB_URL)
  .then(async () => {
    console.log('✅ Successfully connected to MongoDB')

    // Call init-Admin
    await initAdmin()

    const port = process.env.PORT ? Number(process.env.PORT) : 3000

    httpServer.listen(port, () => {
      const io = Socket.getIo()
      io.on('connection', socket => {
        console.log('Socket id: ', socket.id)
        console.log('Server connected')
      })
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
  })

module.exports = app
