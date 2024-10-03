const Category = require("./../models/categoryModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const slugify = require("slugify");
const { queryHelper } = require("./../utils/index");

const createCategory = async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name, { lower: true });
  const category = await Category.create({ name, slug });

  res.status(StatusCodes.CREATED).json({ category });
};

const getAllCategories = async (req, res) => {
  const { docs, page, limit } = await queryHelper(Category, req);
  res.status(StatusCodes.OK).json({ categories: docs, count: docs.length });
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
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
};
