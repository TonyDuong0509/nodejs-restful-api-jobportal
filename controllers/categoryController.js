const Category = require("./../models/categoryModel");
const { StatusCodes } = require("http-status-codes");
const { queryHelper } = require("./../utils/index");

const getAllCategories = async (req, res) => {
  const { docs, page, limit } = await queryHelper(Category, req);
  res.status(StatusCodes.OK).json({ categories: docs, count: docs.length });
};

module.exports = { getAllCategories };
