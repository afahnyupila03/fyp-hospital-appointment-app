const { StatusCodes } = require("http-status-codes");

const Notification = require("../../models/notification");

export const notifications = async (req, res) => {
  try {
    const patientId = req.user.id;

    if (!patientId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized access. Please log in." });
    }

    const notifications = await Notification.find({
      $or: [{ sender: patientId }, { receiver: patientId }],
    })
      .sort({ createdAt: -1 })
      .populate("receiver")
      .populate("appointment");

    const count = await Notification.countDocuments({
      $or: [{ sender: patientId }, { receiver: patientId }],
    });

    res.status(StatusCodes.OK).json({
      message: "patient notifications",
      notifications,
      count,
    });
  } catch (error) {
    console.error("server error querying patient notifications: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "error quering patient notifications",
      error: error.message,
    });
  }
};

export const notification = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;

    if (!patientId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized access. Please log in." });
    }

    if (!id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "notification does not exist" });
    }

    const notifications = await Notification.findOne({
      _id: id,
      $or: [{ sender: patientId }, { receiver: patientId }],
    })
      .populate("receiver")

      .populate("appointment");

    res.status(StatusCodes.OK).json({
      message: "patient notification",
      notifications,
      count,
    });
  } catch (error) {
    console.error("server error querying patient notification: ", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "error quering patient notification",
      error: error.message,
    });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const patientId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!patientId) {
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
      $or: [{ sender: patientId }, { receiver: patientId }],
    })
      .populate("receiver")
      .populate("sender")
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
