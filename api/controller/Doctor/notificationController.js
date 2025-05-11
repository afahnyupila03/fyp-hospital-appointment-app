const { StatusCodes } = require("http-status-codes");
const Notification = require("../../models/notification");
const Doctor = require("../../models/doctor");

exports.requestNotificationPermission = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { granted } = req.body;

    await Doctor.findByIdAndUpdate(doctorId, {
      notificationPermission: granted,
    });

    res.status(StatusCodes.OK).json({
      message: "Notification permission grant success",
    });
  } catch (error) {
    console.error("error granting notification permission: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to change user notification default state",
      error: error.message,
    });
  }
};

exports.viewNotifications = async (req, res) => {
  try {
    const doctorId = req.user.id;

    if (!doctorId) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        message: "doctor id not found. please log into account again.",
      });
    }

    const notifications = await Notification.find({
      $or: [{ sender: doctorId }, { receiver: doctorId }],
    })
      .sort({ createdAt: -1 })
      .populate("receiver")
      .populate("appointment");

    const count = await Notification.countDocuments({
      $or: [{ sender: doctorId }, { receiver: doctorId }],
    });

    res.status(StatusCodes.OK).json({
      message: "doctor notifications",
      notifications,
      count,
    });
  } catch (error) {
    console.error("view notifications controller error: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "server error for quering notifications",
      error: error.message,
    });
  }
};

exports.viewNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const doctorId = req.user.id;

    if (!doctorId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized access. Please log in." });
    }

    const notification = await Notification.findOne({
      _id: id,
      $or: [{ sender: doctorId }, { receiver: doctorId }],
    })
      .populate("receiver")
      .populate("sender")
      .populate("appointment");

    if (!notification) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Notification not found",
      });
    }

    // Auto change notification status from 'read' to 'unread'.
    if (notification.status === "unread") {
      notification.status = "read";
      await notification.save();
    }

    res.status(StatusCodes.OK).json({
      message: "doctor notification",
      notification,
    });
  } catch (error) {
    console.error("view notification controller error: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "server error for quering notification",
      error: error.message,
    });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!doctorId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized access. Please log in." });
    }

    const allowedStatuses = ["read", "unread"];
    if (!allowedStatuses.includes(status)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Invalid status value. Must be 'read' or 'unread'.",
      });
    }

    const notification = await Notification.findById(id)
      .populate("receiver")
      .populate("appointment");

    if (!notification) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Notification not found.",
      });
    }

    notification.status = status;
    await notification.save();

    res.status(StatusCodes.OK).json({
      message: "notification update success",
      notification,
    });
  } catch (error) {
    console.error("update notification controller error: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "server error for updating notification",
      error: error.message,
    });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const doctorId = req.user.id;
    const { id } = req.params;

    if (!doctorId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Please reauthenticate account to perform action." });
    }

    const ids = id.split(","); // Check if id is a comma-separated list.

    if (ids.length === 1) {
      await Notification.findByIdAndDelete(ids[0]);
    } else {
      await Notification.deleteMany({ _id: { $in: ids } });
    }
    console.log('notification delete success')

    res.status(StatusCodes.OK).json({
      message: "Notification(s) delete success",
    });
  } catch (error) {
    console.log("error deleting doctor notification(s)");
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error deleting doctor notification(s)",
      error: error.message,
    });
  }
};
