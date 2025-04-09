const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");

const Logout = require("../../models/logout");
const User = require("../../models/user");

const generateToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      id: user._id,
      role: user.role,
    },
    "patient_secret_token",
    {
      expiresIn: "2hr",
    }
  );
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingPatient = await User.findOne({ email: email });
    if (existingPatient) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Patient account with email already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const patient = new User({
      name,
      email,
      password: hashedPassword,
    });
    const data = await patient.save();

    const token = generateToken(data);

    res.status(StatusCodes.CREATED).json({
      message: "Patient account created",
      data,
      token,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error creating patient account",
      error: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await User.findOne({ email: email });
    if (!patient) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "No patient account exist with email",
      });
    }

    const passwordMatch = await bcrypt.compare(password, patient.password);
    if (!passwordMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Wrong password, please enter correct password",
      });
    }

    const token = generateToken(patient);

    res.status(StatusCodes.OK).json({
      message: "Success login to patient account",
      patient,
      token,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Log in error to patient account",
      error: error.message,
    });
  }
};

exports.logoutUser = async (req, res) => {
  try {
    const authHeader = req.get("Authorization");
    console.log("Auth Header:", authHeader);
    if (!authHeader) {
      return res.status(401).json({ message: "Patient not authenticated." });
    }

    const token = authHeader.split(" ")[1];
    console.log("toke: ", token);
    if (!token) {
      return res.status(401).json({ message: "Token is missing." });
    }

    // Check if token is already blacklisted
    const blacklisted = await Logout.findOne({ token });
    if (blacklisted) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Token blacklisted. Please login again." });
    }

    // Verify the token before blacklisting
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, "patient_secret_token");
      console.log("Decoded token:", decodedToken);
    } catch (err) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid or expired token." });
    }

    // Blacklist token
    const result = await Logout.create({ token });
    console.log("Token blacklisted successfully:", result);

    return res
      .status(StatusCodes.CREATED)
      .json({ message: "Patient account logout success", token: result });
  } catch (error) {
    console.log("Logout error:", error.message);
    return res
      .status(500)
      .json({ message: "Logout failed.", error: error.message });
  }
};
