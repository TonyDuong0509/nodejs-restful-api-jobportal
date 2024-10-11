const User = require("./../models/userModel");
const Notification = require("./../models/notificationModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const { validateMongoDbId } = require("./../utils/index");

const createNotification = async (userId, message, link) => {
  await Notification.create({ user: userId, message: message, link: link });
};

const getAllNotifications = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);

  const existingUser = await User.findById({ _id: userId });
  if (!existingUser) {
    throw new CustomError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }

  if (
    (existingUser && existingUser.role === "jobseeker") ||
    (existingUser && existingUser.role === "company") ||
    (existingUser && existingUser.role === "admin")
  ) {
    const notifications = await Notification.find({
      user: existingUser._id,
    })
      .sort("-createdAt")
      .select("-_id -user");

    res.status(StatusCodes.OK).json({ notifications });
  }
};

module.exports = { createNotification, getAllNotifications };
