const Admin = require("../../models/admin");
const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const Logout = require('../../models/logout')

const generateToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      id: user._id,
      role: user.role,
    },
    "admin_secret_token",
    { expiresIn: "2hr" }
  );
};

exports.initAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email: email });

    if (existingAdmin) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Admin already exist",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    const result = await admin.save();
    const token = generateToken(result);

    res.status(StatusCodes.CREATED).json({
      message: "admin account created.",
      token,
      result,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error creating admin account",
      error: error.message,
    });
    throw error;
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "No admin account exist with email",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid password, please enter correct password.",
      });
    }

    const token = generateToken(admin);

    res.status(StatusCodes.OK).json({
      message: "Log in to admin account",
      token,
      admin,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error log in to admin account",
      error: error.message,
    });
    throw error;
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const adminId = req.user.id

    const admin = await Admin.findById(adminId).select("-password") // Exclude password field

    if (!admin) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'Admin not found'
      })
    }
    
    res.status(StatusCodes.OK).json({
      message: 'admin data retrieved successfully.',
      admin
    })
  }
  catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Error fetching admin data',
      error: error.message
    })
  }
}

exports.logoutAdmin = async (req, res) => {
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

    const blacklisted = await Admin.findOne({ token })
    .populate('_id');
    if (blacklisted) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "user account signed out, please login again",
      });
    }

    // verify token before blacklisting
    let decoded;
    try {
      decoded = jwt.verify(token, "admin_secret_token");
    } catch (err) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "Invalid or expired token",
        error: err.message,
      });
    }

    const result = await Logout.create({ token });

    res.status(StatusCodes.CREATED).json({
      message: "admin logout success",
      result,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error logging out admin from account",
      error: error.message,
    });
  }
};
