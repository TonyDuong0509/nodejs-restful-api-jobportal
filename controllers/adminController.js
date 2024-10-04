const User = require("./../models/userModel");
const Category = require("./../models/categoryModel");
const Company = require("./../models/companyModel");
const Jobseeker = require("./../models/jobseekerModel");
const slugify = require("slugify");
const { StatusCodes } = require("http-status-codes");
const CustomErr = require("./../errors");
const { queryHelper } = require("./../utils/index");

const getAllUsers = async (req, res) => {
  const { docs, page, limit } = await queryHelper(User, req);
  res.status(StatusCodes.OK).json({ users: docs, count: docs.length });
};

const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById({ _id: userId });
  if (!user) {
    throw new CustomErr.NotFoundError(`Not found user with this ID: ${userId}`);
  }

  if (user.role === "company") {
    await Company.findOneAndDelete({ user: userId });
    await User.findByIdAndDelete({ _id: userId });
  }

  if (user.role === "jobseeker") {
    await Jobseeker.findOneAndDelete({ user: userId });
    await User.findByIdAndDelete({ _id: userId });
  }

  res.status(StatusCodes.OK).json({ message: "Deleted User Successfully" });
};

const createCategory = async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name, { lower: true });
  const category = await Category.create({ name, slug });

  res.status(StatusCodes.CREATED).json({ category });
};

const getSingleCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById({ _id: id });
  if (!category) {
    throw new CustomError.NotFoundError(
      `Not found category with this ID: ${id}`
    );
  }
  res.status(StatusCodes.OK).json({ category });
};

const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const category = await Category.findById({ _id: id });
  if (!category) {
    throw new CustomError.NotFoundError(
      `Not found category with this ID: ${id}`
    );
  }

  category.name = name;
  category.slug = slugify(name, {
    lower: true,
  });

  await category.save();

  res.status(StatusCodes.OK).json({ category });
};

const deleteCategory = async (req, res) => {
  const { id } = req.params;
  const category = await Category.findById({ _id: id });
  if (!category) {
    throw new CustomError.NotFoundError(
      `Not found category with this ID: ${id}`
    );
  }

  const deleteCategory = await Category.findOneAndDelete({ _id: id });

  res.status(StatusCodes.NO_CONTENT).json({ deleteCategory });
};

module.exports = {
  getAllUsers,
  deleteUser,
  createCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
