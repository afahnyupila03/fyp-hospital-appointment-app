const { StatusCodes } = require("http-status-codes");

const Appointment = require("../../models/doctor");
const Notification = require("../../models/notification");
const User = require("../../models/user");

exports.viewAppointments = async (req, res) => {
  try {
    const doctorId = req.user.id;

    console.log('doctor appointments id: ', doctorId)

    const appointments = await Appointment.find({ doctorId: doctorId })
      .populate("doctorId", "name email specialization department")
      .populate("patientId", "email name reason notes")
      .sort({ createdAt: -1 });

    if (!appointments) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "error viewing doctors appointment",
      });
    }

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
    const doctorId = req.userId;

    if (!doctorId)
      res.status(401).json({ message: "Unauthorized access. Please log in." });

    const appointment = await Appointment.findById({
      _id: id,
      doctorId: doctorId,
    })
      .populate("doctorId", "name specialization department")
      .populate("patientId", "name reason notes");

    if (!appointment)
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "Appointment doesn't exist",
      });

    res.status(StatusCodes.OK).json({
      message: "doctor appointment",
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
    });

    if (!appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "appointment doesn't exist",
      });
    }

    appointment.status = status;
    const updatedAppointment = appointment.save();

    // Create a notification to send to the patient.
    const notification = new Notification({
      sender: doctorId,
      receiver: appointment.patientId,
      type: "appointment_status_update",
      message: `Your appointment status has been updated to "${status}"`,
      appointment: appointment._id,
    });

    await notification.save();

    res.status(StatusCodes.OK).json({
      message: "patient appointment update success",
      updatedAppointment,
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
