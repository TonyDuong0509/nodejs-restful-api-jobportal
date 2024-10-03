const User = require("./../models/userModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const { checkPermissions } = require("./../utils/index");

const getAllUsers = async (req, res) => {
  const users = await User.find({}).select("-password");
  res.status(StatusCodes.OK).json({ users, count: users.length });
};

const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById({ _id: id });
  if (!user) {
    throw new CustomError.NotFoundError(`Not found user with this ID: ${id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

module.exports = { getAllUsers, getSingleUser };
