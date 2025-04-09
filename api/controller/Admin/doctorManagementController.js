const Doctor = require("../../models/doctor");

const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");

exports.createDoctor = async (req, res) => {
  try {
    const user = req.user;
    const { name, email, password, specialization, department } = req.body;

    const existingUser = await Doctor.findOne({ email: email });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "email already exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const doctor = new User({
      name,
      email,
      password: hashPassword,
      specialization,
      department,
      createdBy: user.id,
    });

    const result = await doctor.save();

    res.status(StatusCodes.CREATED).json({
      message: "doctor account created",
      result,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error creating doctor account",
      error: error.message,
    });
  }
};

exports.viewDoctors = async (req, res) => {
  try {
    const adminId = req.user.id;
    const doctors = await Doctor.find({ role: "doctor" })
      .populate("createdBy", "email name role")
      .sort({ createdAt: -1 });

    if (!doctors) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Error, doctors not found",
      });
    }
    res.status(StatusCodes.OK).json({
      message: "view all doctors",
      doctors,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error viewing all doctors",
      error: error.message,
    });
  }
};

exports.viewDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById({ _id: id, role: "doctor" });

    if (!doctor) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json1({ message: "Error, doctor not found" });
    }

    return res.status(StatusCodes.OK).json({
      message: "view doctor account",
      doctor,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error viewing doctor",
      error: error.message,
    });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, specialization, department } = req.body;

    const doctor = await Doctor.findById(id);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Error, doctor not found",
      });
    }

    doctor.email = email || doctor.email;
    doctor.name = name || doctor.name;
    doctor.specialization = specialization || doctor.specialization;
    doctor.department = department || doctor.department;

    const updatedDoctor = await doctor.save();

    res.status(StatusCodes.CREATED).json({
      message: "doctor update success",
      updatedDoctor,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error updating doctor information",
      error: error.message,
    });
  }
};

exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await User.findByIdAndDelete(id);

    if (!doctor || doctor.role !== "doctor") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Error, doctor not found" });
    }

    await doctor.deleteOne();

    res.status(StatusCodes.OK).json({
      message: "doctor account deleted",
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error deleting doctor account",
      error: error.message,
    });
  }
};
