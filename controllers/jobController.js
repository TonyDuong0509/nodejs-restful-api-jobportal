const Job = require("./../models/jobModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const { queryHelper } = require("./../utils/index");

const getAllJobs = async (req, res) => {
  const populateOptions = {
    path: "category",
    select: "_id name",
  };
  const { docs, page, limit, totalPages } = await queryHelper(
    Job,
    req,
    populateOptions
  );
  res
    .status(StatusCodes.OK)
    .json({ jobs: docs, count: docs.length, totalPages });
};

const getSingleJob = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById({ _id: id }).populate({
    path: "category",
    select: "_id name",
  });
  res.status(StatusCodes.OK).json({ job });
};

module.exports = { getAllJobs, getSingleJob };
