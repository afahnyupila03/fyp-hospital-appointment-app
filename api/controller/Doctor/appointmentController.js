const { StatusCodes } = require("http-status-codes");

const Appointment = require("../../models/appointment");
const Notification = require("../../models/notification");
const User = require("../../models/user");
const { default: mongoose } = require("mongoose");

exports.viewAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;

    console.log("doctor appointments id: ", doctorId);

    const appointments = await Appointment.find({ doctorId: doctorId })
      .populate("doctorId", "name email specialization department")
      .populate("patientId", "email name")
      .populate("notifications")
      .sort({ createdAt: -1 });

    if (!appointments || appointments.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "no appointments for this doctor found",
      });
    }

    console.log("APPOINTMENTS: ", appointments);

    res.status(StatusCodes.OK).json({
      message: "doctor appointments",
      appointments,
    });
  } catch (error) {
    console.log("error fetching doctor appointments: ", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "failed to fetch appointments",
      error: error.message,
    });
    throw error;
  }
};

exports.viewAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    if (!doctorId) {
      return res
        .status(401)
        .json({ message: "Unauthorized access. Please log in." });
    }

    const appointment = await Appointment.findOne({
      _id: id,
      doctorId,
    })
      .populate(
        "doctorId",
        "_id email name specialization department schedules"
      )
      .populate("patientId", "_id email name")
      .populate("notifications");

    if (!appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Appointment doesn't exist or access denied",
      });
    }

    res.status(StatusCodes.OK).json({
      message: "doctor appointment retrieved successfully",
      appointment,
    });
  } catch (error) {
    console.log("error fetching doctor appointment: ", error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "failed to fetch appointments",
      error: error.message,
    });
    throw error;
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const doctorId = req.user.id;

    const appointment = await Appointment.findOne({
      _id: id,
      doctorId: doctorId,
    }).populate("notifications");

    if (!appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "appointment doesn't exist",
      });
    }

    appointment.status = status;

    // Create a notification to send to the patient.
    const notification = new Notification({
      sender: doctorId,
      receiver: appointment.patientId,
      type: "appointment_status_update",
      message: `Your appointment status has been updated to "${status}"`,
      appointment: appointment._id,
    });

    const savedNotification = await notification.save();
    appointment.notifications.push(savedNotification._id);

    // Save the updated appointment
    const updatedAppointment = await appointment.save();

    res.status(StatusCodes.OK).json({
      message: "patient appointment update success",
      updatedAppointment,
      savedNotification,
    });
  } catch (error) {
    console.log(error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update appointment",
      error: error.message,
    });
    throw error.message;
  }
};
