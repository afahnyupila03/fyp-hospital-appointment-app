const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User", // could be doctor or patient
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User", // Could be doctor or patient.
      required: true,
    },
    type: {
      type: String,
      enum: [
        "appointment_request",
        "appointment_request_update",
        "appointment_status_update",
        "general",
      ],
    },
    message: {
      type: String,
      required: true,
    },
    appointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
