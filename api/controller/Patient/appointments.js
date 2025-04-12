const { StatusCodes } = require("http-status-codes");

const Appointment = require("../../models/appointment");
const User = require("../../models/user");
const Doctor = require("../../models/doctor");
const Notification = require("../../models/notification");

exports.viewAppointments = async (req, res) => {
  try {
    const user = req.user;

    const appointments = await Appointment.find({ patientId: user.id })
      .populate("patientId", "email name reason notes")
      .populate("doctorId", "email name specialization department")
      .sort({ createdAt: -1 });

    if (!appointments) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Error find patient appointments",
      });
    }

    res.status(StatusCodes.OK).json({
      message: "viewing all patient appointments",
      appointments,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error loading all your appointments",
      error: error.message,
    });
  }
};

exports.viewAppointment = async (req, res) => {
  try {
    const user = req.user;
    const { id } = req.params;

    const appointment = await Appointment.findOne({
      _id: id,
      patientId: user.id,
    })
      .populate("doctorId", "email name specialization department")
      .populate("patientId", "email name reason notes");

    if (!appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Error, could not find appointment",
      });
    }

    res.status(StatusCodes.OK).json({
      message: "patient appointment load success",
      appointment,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error loading patient appointment",
      error: error.message,
    });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { date, timeSlot, reason, doctor, notes } = req.body;

    const doc = await Doctor.findOne({ name: doctor });
    if (!doc) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "selected doctor does not exist",
      });
    }
    const doctorId = doc._id;

    const user = await User.findOne({ _id: patientId });

    if (!user) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "patient not found, please login or create account to continue",
      });
    }

    const createdAppointment = await Appointment({
      patientId,
      doctorId,
      date,
      timeSlot,
      reason,
      notes,
    });

    // Push appointment to both patient and doctor.
    user.appointments.push(createdAppointment);
    doc.appointments.push(createdAppointment);

    // create notification and push notification.
    const notification = new Notification({
      sender: patientId,
      receiver: doctorId,
      type: "appointment_request",
      message: "Appointment request sent successfully.",
      appointment: createdAppointment._id,
    });

    const notify = await notification.save();

    // Push notifications ref to patient, doctor and appointment.
    user.notifications.push(notify._id);
    doc.notifications.push(notify._id);
    createdAppointment.notifications.push(notify._id);

    // save created appointment to db.
    await user.save();
    await doc.save();
    const data = await createdAppointment.save();

    res.status(StatusCodes.CREATED).json({
      message: "appointment create success",
      data,
      notify,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error creating patient appointment",
      error: error.message,
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const user = req.user;
    const { doctor, date, timeSlot, reason, notes } = req.body;
    const { id } = req.params;

    const appointment = await Appointment.findById(id).populate(
      "notifications",
      "sender receiver type message appointment status"
    );
    if (!appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "appointment does not exist",
      });
    }

    // Handle doctor change
    let newDoctor;
    if (doctor) {
      newDoctor = await Doctor.findOne({ name: doctor });
      if (!newDoctor) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "No doctor found",
        });
      }

      const oldDoctorId = appointment.doctorId.toString();
      const newDoctorId = newDoctor._id.toString();

      if (oldDoctorId !== newDoctorId) {
        await Doctor.findByIdAndUpdate(oldDoctorId, {
          $pull: { appointments: appointment._id },
        });

        await Doctor.findByIdAndUpdate(newDoctorId, {
          $addToSet: { appointments: appointment._id },
        });

        appointment.doctorId = newDoctorId;
      }
    }

    // Update fields
    if (date) appointment.date = date;
    if (timeSlot) appointment.timeSlot = timeSlot;
    if (reason) appointment.reason = reason;
    if (notes) appointment.notes = notes;

    const updatedAppointment = await appointment.save();

    // Create and push notification.
    const notification = new Notification({
      sender: user.id,
      receiver: appointment.doctorId,
      type: newDoctor ? "appointment_request" : "appointment_request_update",
      message: newDoctor
        ? "Appointment request"
        : "Appointment request update.",
      appointment: appointment._id,
    });
    const notify = await notification.save();

    await User.findByIdAndUpdate(user.id, {
      $addToSet: { notifications: notify._id },
    });
    await Doctor.findByIdAndUpdate(appointment.doctorId, {
      $addToSet: { notification: notify._id },
    });

    appointment.notifications.push(notify._id);
    await appointment.save();

    res.status(StatusCodes.CREATED).json({
      message: "appointment updated",
      updatedAppointment,
      notify,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error updating patient appointment",
      error: error.message,
    });
  }
};
