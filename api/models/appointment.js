const mongoose = require('mongoose')
const Schema = mongoose.Schema

const appointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'canceled'],
      default: 'pending'
    },

    reason: {
      type: String,
      enum: ['consultation', 'follow-up', 'referral'],
      required: true
    },
    notes: {
      type: String,
      maxLength: 500
    }
  },
  { timestamps: true }
)

module.exports = mongoose.model('Appointment', appointmentSchema)
