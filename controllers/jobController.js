const Job = require("./../models/jobModel");
const Category = require("./../models/categoryModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const { queryHelper, validateMongoDbId } = require("./../utils/index");

const getAllJobs = async (req, res) => {
  const populateOptions = {
    path: "category",
    select: "-_id name",
  };
  const selectedFiles = "-_id -isFull";
  const { docs, page, limit, totalPages } = await queryHelper(
    Job,
    req,
    populateOptions,
    selectedFiles
  );

  const jobsData = docs.map((job) => {
    const jobData = { ...job.toObject() };
    const isLoggedIn = req.user ?? null;
    if (!isLoggedIn) {
      jobData.offeredSalary = "Please login to view offered salary";
    }

    return jobData;
  });

  res
    .status(StatusCodes.OK)
    .json({ jobs: jobsData, count: docs.length, totalPages });
};

const getSingleJob = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const job = await Job.findById({ _id: id })
    .populate({
      path: "category",
      select: "-_id name",
    })
    .populate({
      path: "company",
      select: "-_id -jobPostings -updatedAt",
      populate: {
        path: "user",
        select: "name address about -_id",
      },
    })
    .select("-_id -isFull -slug -updatedAt");

  if (!job) {
    throw new CustomError.NotFoundError(`Not found job with this ID: ${id}`);
  }

  const jobData = { ...job.toObject() };
  const isLoggedIn = req.user ?? null;
  if (!isLoggedIn) {
    jobData.offeredSalary = "Please login to view offered salary";
  }

  res.status(StatusCodes.OK).json({ job: jobData });
};

const getAllJobsByCategory = async (req, res) => {
  const { categoryId } = req.body;

  validateMongoDbId(categoryId);

  const existingCategory = await Category.findById({ _id: categoryId });
  if (!existingCategory) {
    throw new CustomError.NotFoundError(
      `Not found category with this ID: ${categoryId}`
    );
  }

  const queryFilter = { category: existingCategory._id };

  if (req.query.title) {
    const regexTitle = new RegExp(req.query.title, "i");
    queryFilter.title = { $regex: regexTitle };
  }

  const modelsCount = await Job.countDocuments(queryFilter);

  const page = req.query.page || 1;
  const limit = req.query.limit || 6;
  const skip = (page - 1) * limit;

  if (skip >= modelsCount) {
    throw new CustomError.BadRequestError("The page does not exist");
  }

  let query = Job.find(queryFilter)
    .populate({
      path: "category",
      select: "-_id name",
    })
    .select("-_id -isFull -slug -updatedAt")
    .skip(skip)
    .limit(limit);

  const jobs = await query;

  const jobsData = jobs.map((job) => {
    const jobData = { ...job.toObject() };
    const isLoggedIn = req.user ?? null;
    if (!isLoggedIn) {
      jobData.offeredSalary = "Please login to view offered salary";
    }
    return jobData;
  });

  res.status(StatusCodes.OK).json({
    jobs: jobsData,
    count: jobsData.length,
    totalPages: Math.ceil(modelsCount / limit),
  });
};

module.exports = { getAllJobs, getSingleJob, getAllJobsByCategory };
