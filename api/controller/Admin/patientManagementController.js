const User = require("../../models/user");

const { StatusCodes } = require("http-status-codes");

exports.viewPatients = async (req, res) => {
  try {
    const patients = await User.find({ role: "patients" }).sort({
      createdAt: -1,
    });

    if (!patients) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Error, patients not found",
      });
    }

    res.status(StatusCodes.OK).json({
      message: "viewing patients",
      patients,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error viewing all patients",
      error: error.message,
    });
  }
};

exports.viewPatient = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await User.findById({ _id: id });
    if (!patient) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Error, patient not found",
      });
    }

    return res.status(StatusCodes.OK).json({
      message: "patient account",
      patient,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error viewing patient account",
      error: error.message,
    });
  }
};

exports.archivePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const patient = await User.findById(id);

    if (!patient) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "No patient with id exist.",
      });
    }

    patient.isActive = isActive;
    patient.terminatedAt = new Date();

    await patient.save();

    res.status(StatusCodes.CREATED).json({
      message: "Success archiving patient profile",
      patient,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error archiving patient profile",
      error: error.message,
    });
  }
};
