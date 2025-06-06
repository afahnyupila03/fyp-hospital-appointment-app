const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");

const Doctor = require("../../models/doctor");
const Logout = require("../../models/logout");

const generateToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      id: user._id,
      role: user.role,
    },
    "doctor_secret_token",
    { expiresIn: "2hr" }
  );
};

exports.loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email: email });
    if (!doctor) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message:
          "No account with email exist, please see admin to create account.",
      });
    }
    if (doctor.role !== "doctor") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Can not perform login, doctor privileges required",
      });
    }

    const passwordMatch = await bcrypt.compare(password, doctor.password);
    if (!passwordMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Wrong password, please enter correct password",
      });
    }

    const token = generateToken(doctor);

    res.status(StatusCodes.OK).json({
      message: "Success login to doctor account.",
      token,
      doctor,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error logging doctor into account",
      error: error.message,
    });
  }
};

exports.getDoctor = async (req, res) => {
  try {
    const doctorId = req.user.id;

    const doctor = await Doctor.findById(doctorId)
      .populate("appointments")
      .populate("notifications")
      .populate("schedules")
      .select("-password"); // Exclude password field

    if (!doctor) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Doctor not found",
      });
    }

    res.status(StatusCodes.OK).json({
      message: "doctor data retrieved successfully.",
      doctor,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching doctor data",
      error: error.message,
    });
  }
};

exports.logoutDoctor = async (req, res) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "account not authenticated",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Token is missing",
      });
    }

    const blacklisted = await Doctor.findOne({ token });
    if (blacklisted) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "user account signed out, please login again",
      });
    }

    // verify token before blacklisting
    let decoded;
    try {
      decoded = jwt.verify(token, "doctor_secret_token");
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid or expired token",
        error: err.message,
      });
    }

    const result = await Logout.create({ token });

    res.status(StatusCodes.CREATED).json({
      message: "doctor logout success",
      result,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error logging out doctor from account",
      error: error.message,
    });
  }
};
