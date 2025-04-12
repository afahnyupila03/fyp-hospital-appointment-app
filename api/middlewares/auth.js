const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const Logout = require("../models/logout");
const Admin = require("../models/admin");
const Doctor = require("../models/doctor");
const User = require("../models/user");

const JWT_SECRETS = {
  admin: "admin_secret_token",
  doctor: "doctor_secret_token",
  patient: "patient_secret_token",
};

// Map roles to their respective models.
const ROLE_MODELS = {
  admin: Admin,
  patient: User,
  doctor: Doctor,
};

exports.auth = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Authorization header missing or is invalid",
      });
    }
    const token = authHeader.split(" ")[1];
    console.log(token);

    if (!token) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "user token missing." });
    }

    const blacklisted = await Logout.findOne({ token });
    if (blacklisted) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Token has been invalided. Please log in again",
      });
    }

    let decoded = null;
    let matchedRole = null;

    // Try all roles's secrets until one works.
    for (const [role, secret] of Object.entries(JWT_SECRETS))
      try {
        decoded = jwt.verify(token, secret);
        matchedRole = role;
        break;
      } catch (_) {
        continue;
      }

    if (!decoded || !matchedRole) {
      return res.status(StatusCodes.FORBIDDEN).json({
        message: "Invalid or expired token decoded",
      });
    }

    const MODEL = ROLE_MODELS[matchedRole];
    const user = await MODEL.findById(decoded.id);

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "User not found",
      });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    console.log("authenticated user", req.user);

    next();
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to authenticate user",
      error: error.message,
    });
  }
};

exports.restrictTo = (role) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user || user.role !== role) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: `${role[0].toUpperCase() + role.slice(1)} privileges required`,
      });
    }

    next();
  };
};


