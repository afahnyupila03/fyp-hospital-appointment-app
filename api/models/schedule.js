const mongoose = require('mongoose')
const Schema = mongoose.Schema

const scheduleSchema = new Schema({
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  availableSlot: {
    type: Date,
    required: true
  }
}, { timestamps: true })

module.exports = mongoose.model('Schedule', scheduleSchema)
