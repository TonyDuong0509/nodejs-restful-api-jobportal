const Category = require("./../models/categoryModel");
const { StatusCodes } = require("http-status-codes");
const { queryHelper } = require("./../utils/index");

const getAllCategories = async (req, res) => {
  const selectedFields = "-_id";
  const { docs, page, limit, totalPages } = await queryHelper(
    Category,
    req,
    null,
    selectedFields
  );
  res
    .status(StatusCodes.OK)
    .json({ categories: docs, count: docs.length, totalPages });
};

module.exports = { getAllCategories };
