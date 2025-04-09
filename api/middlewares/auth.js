const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

const Logout = require("../models/logout");
const Admin = require("../models/admin");
const Doctor = require("../models/doctor");
const User = require("../models/user");

const JWT_SECRETS = {
  admin: "admin_secret_token",
  doctor: "doctor_secrete_token",
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
    const user = await MODEL.findById(decoded.userId);

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

// Usage:
// app.get('/admin-route', auth, restrictTo("admin"))

exports.isAdmin = (req, res, next) => {
  const user = req.user;
  const userRole = req.user.role;
  if (!user || userRole !== "admin") {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Admin privileges required",
    });
  }

  next();
};

exports.isDoctor = (req, res, next) => {
  const user = req.user;
  const role = user.role;

  if (user || role !== "doctor") {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Doctor privileges required",
    });
  }

  next();
};

exports.isPatient = (req, res, next) => {
  const user = req.user;
  const role = user.role;

  if (user || role !== "patient") {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Patient privileges required",
    });
  }

  next();
};

exports.userAuth = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "patient account not authenticated" });
  }

  const token = authHeader.split(" ")[1];
  console.log("auth token: ", token);
  if (!token) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "patient token missing." });
  }

  // Check if token is blacklisted.
  const blacklisted = await Logout.findOne({ token });
  if (blacklisted) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Token blacklisted, please log in again" });
  }

  // Verify token
  // let decodedToken
  try {
    const decodedToken = jwt.verify(token, "patientToken");

    console.log("✅ decodedToken:", decodedToken);

    // Confirm this is a string
    req.userId = decodedToken.userId?.toString();

    console.log("✅ req.userId:", req.userId);

    if (!req.userId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid token payload.",
      });
    }

    next();
  } catch (error) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Invalid or expired token." });
  }
};

exports.doctorAuth = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader)
    res.status(401).json({ message: "doctor account not authenticated" });

  const token = authHeader.split(" ")[1];
  if (!token)
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "doctor token missing." });

  const blacklisted = await Logout.findOne({ token });

  if (blacklisted)
    res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Token blacklisted, please log in again" });

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "doctorToken");
  } catch (error) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Invalid or expired token." });
  }

  req.userId = decodedToken.userId;

  next();
};

exports.adminAuth = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "admin account not authenticated",
    });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "admin token is missing, login to continue",
    });
  }

  const blacklisted = await Logout.findOne({ token });
  if (!blacklisted) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      message: "Please log in to admin account perform action",
    });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "admin_secret_token");
  } catch (error) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ message: "Invalid or expired token." });
  }

  req.userId = decodedToken.userId;
  req.userRole = decodedToken.role;

  next();
};
