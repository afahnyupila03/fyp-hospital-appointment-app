const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { specialties, departments } = require("../constants/index");

const doctorSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: String,
    },
    specialization: {
      type: String,
      enum: specialties,
    }, // Only for doctors
    department: {
      type: String,
      enum: departments,
    }, // Only for doctors
    password: {
      type: String,
      required: true,
    },
    schedules: [
      {
        type: Schema.Types.ObjectId,
        ref: "Schedule",
        required: true,
      },
    ],
    role: {
      type: String,
      default: "doctor",
    },
    appointments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
