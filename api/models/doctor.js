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
    notifications: [
      {
        type: Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    notificationPermission: {
      type: Boolean,
      default: false
    },
    terminatedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doctor", doctorSchema);
