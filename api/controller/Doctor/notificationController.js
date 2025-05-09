const { StatusCodes } = require("http-status-codes");
const Notification = require("../../models/notification");

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

    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "notification does not exist" });
    }

    const notification = await Notification.findOne({
      _id: id,
      $or: [{ sender: doctorId }, { receiver: doctorId }],
    })
      .populate("receiver")
      .populate("sender")
      .populate("appointment");

    if (!appointment) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "Notification not found",
      });
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

    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "notification does not exist" });
    }

    const notification = await Notification.findOne({
      _id: id,
      sender: doctorId,
    })
      .populate("receiver")
      .populate("appointment");

    if (!notification) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: "notification does not exist",
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
