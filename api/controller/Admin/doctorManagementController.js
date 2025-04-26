const Doctor = require("../../models/doctor");
const Schedule = require("../../models/schedule");

const bcrypt = require("bcrypt");
const { StatusCodes } = require("http-status-codes");

exports.createDoctor = async (req, res) => {
  try {
    const user = req.user;
    const { name, email, password, specialization, department, schedule } =
      req.body;

    if (!Array.isArray(schedule) || schedule.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "At least one schedule entry (date and time) is required",
      });
    }

    const existingUser = await Doctor.findOne({ email: email });
    if (existingUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "email already exist",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    // STEP_1 Create doctor without schedule
    const doctor = new Doctor({
      name,
      email,
      password: hashPassword,
      specialization,
      department,
      createdBy: user.id,
    });

    const savedDoctor = await doctor.save();

    // STEP_2 create the schedule entries and attach to doctor
    const scheduleEntries = [];
    for (const entry of schedule) {
      const { day, times } = entry;
      if (!day || !Array.isArray(times) || times.length === 0) {
        continue; // Skip invalid entries
      }

      for (const time of times) {
        const scheduleDoc = new Schedule({
          doctorId: savedDoctor._id,
          day,
          time,
        });
        const savedSchedule = await scheduleDoc.save();
        scheduleEntries.push(savedSchedule._id);
      }
    }

    // STEP_3 update te doctor with schedule references.
    savedDoctor.schedules = scheduleEntries;
    await savedDoctor.save();

    res.status(StatusCodes.CREATED).json({
      message: "doctor account created",
      savedDoctor,
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
      .populate("schedules")
      .populate("appointments",)
      // .populate("patientId")
      .select("-password")
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

    const doctor = await Doctor.findById({ _id: id, role: "doctor" })
      .populate("appointments")
      .populate("schedules")
      // .populate("patientId")
      .select("-password");

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
    console.error("fetch doctor server error: ", error.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error viewing doctor",
      error: error.message,
    });
  }
};

exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, specialization, department, schedule } = req.body;

    const doctor = await Doctor.findById(id);

    if (!doctor || doctor.role !== "doctor") {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Error, doctor not found",
      });
    }

    // Update basic info
    doctor.email = email || doctor.email;
    doctor.name = name || doctor.name;
    doctor.specialization = specialization || doctor.specialization;
    doctor.department = department || doctor.department;

    // If schedule is provided, replace it
    if (Array.isArray(schedule) && schedule.length > 0) {
      // Delete existing schedules
      await Schedule.deleteMany({ doctor: doctor._id });

      // Create new schedule documents
      const scheduleDocs = [];

      for (const entry of schedule) {
        const { day, times } = entry;
        if (!day || !Array.isArray(times) || times.length === 0) continue;

        for (const time of times) {
          const newSchedule = new Schedule({
            doctor: doctor._id,
            day,
            time,
          });
          const saved = await newSchedule.save();
          scheduleDocs.push(saved._id);
        }
      }

      // Attach updated schedule IDs to the doctor
      doctor.schedules = scheduleDocs;
    }

    await doctor.save();

    res.status(StatusCodes.OK).json({
      message: "Doctor updated successfully",
      doctor: doctor,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error updating doctor information",
      error: error.message,
    });
  }
};

exports.archiveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const doctor = await Doctor.findById(id);

    if (!doctor || doctor.role !== "doctor") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Error, doctor not found" });
    }

    // Update doctor isActive and terminatedAt.
    doctor.isActive = isActive;
    doctor.terminatedAt = new Date();

    await doctor.save();

    res.status(StatusCodes.OK).json({
      message: "doctor account archived successfully",
      doctor,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error archiving doctor account",
      error: error.message,
    });
  }
};

exports.unarchiveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const doctor = await Doctor.findById(id);

    if (!doctor || doctor.role !== "doctor") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Error, doctor not found" });
    }

    // Update doctor isActive and terminatedAt.
    doctor.isActive = isActive;
    doctor.terminatedAt = null;

    await doctor.save();

    res.status(StatusCodes.OK).json({
      message: "doctor account archived successfully",
      doctor,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error archiving doctor account",
      error: error.message,
    });
  }
};
