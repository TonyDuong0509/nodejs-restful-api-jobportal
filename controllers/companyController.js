const User = require("./../models/userModel");
const Company = require("./../models/companyModel");
const Job = require("./../models/jobModel");
const Category = require("./../models/categoryModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const slugify = require("slugify");
const {
  validateMongoDbId,
  checkPermissions,
  queryHelper,
  handleUploadImage,
} = require("./../utils/index");

const getAllCompanies = async (req, res) => {
  const populateOptions = {
    path: "user",
    select: "name phone address email -_id",
  };
  const selectedFields = "-_id";

  const { docs, page, limit } = await queryHelper(
    Company,
    req,
    populateOptions,
    selectedFields
  );
  res.status(StatusCodes.OK).json({ companies: docs, count: docs.length });
};

const getSingleCompany = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const company = await Company.findById({ _id: id })
    .populate({
      path: "user",
      select: "name phone address email about -_id",
    })
    .select("-_id");
  if (!company) {
    throw new CustomError.NotFoundError(
      `Not found company with this ID: ${id}`
    );
  }
  res.status(StatusCodes.OK).json({ company });
};

const updateProfile = async (req, res) => {
  const { userId } = req.params;
  const { name, phone, address, about, website, logo, employee } = req.body;
  validateMongoDbId(userId);

  const session = await User.startSession();
  session.startTransaction();
  checkPermissions(req.user, userId);

  try {
    // Update properties in User
    const updateUserProps = await User.findOneAndUpdate(
      { _id: userId },
      { name, phone, address, about },
      { new: true, runValidators: true, session }
    );
    if (!updateUserProps) {
      throw new CustomError.NotFoundError(
        `Not found user with this ID: ${userId}`
      );
    }

    // Update properties in Company
    const updateCompanyProps = await Company.findOneAndUpdate(
      { user: userId },
      {
        website,
        logo,
        employee,
      },
      { new: true, runValidators: true, session }
    );
    if (!updateCompanyProps) {
      throw new CustomError.NotFoundError(
        `Not found user with this ID: ${userId}`
      );
    }

    await session.commitTransaction();
    session.endSession();

    res.status(StatusCodes.OK).json({
      updateUserProps,
      updateCompanyProps,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error: ", error);
    throw new CustomError.BadRequestError("Update failed");
  }
};

const uploadLogo = async (req, res) => {
  await handleUploadImage(req, res, "company", Company);
};

const deleteCompany = async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  const company = await Company.findById({ _id: id });
  if (!company) {
    throw new CustomError.NotFoundError(
      `Not found company with this ID: ${id}`
    );
  }
  await User.findByIdAndDelete({ _id: company.user });
  await Company.deleteOne({ _id: id });
  res.status(StatusCodes.NO_CONTENT).json({ message: "Deleted Successfully" });
};

const createJob = async (req, res) => {
  const {
    title,
    description,
    careerLevel,
    type,
    offeredSalary,
    experience,
    qualification,
    skillRequirements,
    quantity,
    category,
  } = req.body;
  const { userId } = req.user;
  validateMongoDbId(userId);

  const slug = slugify(title, { lower: true });

  const existingCategory = await Category.findById({ _id: category });
  if (!existingCategory) {
    throw new CustomError.NotFoundError(
      `Not found category with this ID: ${category}`
    );
  }

  const existingCompany = await User.findById({ _id: userId });
  if (!existingCompany) {
    throw new CustomError.NotFoundError(
      `Not found company with this ID: ${userId}`
    );
  }
  const company = await Company.findOne({ user: existingCompany._id });

  const job = await Job.create({
    title,
    slug,
    description,
    careerLevel,
    type,
    offeredSalary,
    experience,
    qualification,
    skillRequirements,
    quantity,
    category: existingCategory,
    company: userId,
  });

  company.jobPostings.push(job);
  await company.save();
  res.status(StatusCodes.CREATED).json({ job });
};

const uploadJobImage = async (req, res) => {
  await handleUploadImage(req, res, "job", Job);
};

const updateJob = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const { jobId } = req.params;
  validateMongoDbId(jobId);
  const {
    title,
    description,
    careerLevel,
    type,
    offeredSalary,
    experience,
    qualification,
    skillRequirements,
    quantity,
    category,
  } = req.body;
  const existingCompany = await User.findById({ _id: userId });
  if (!existingCompany) {
    throw new CustomError.NotFoundError(
      `Not found company with this ID: ${userId}`
    );
  }
  const company = await Company.findOne({ user: existingCompany._id });
  if (!company || !company.jobPostings || company.jobPostings.length === 0) {
    throw new CustomError.NotFoundError(
      `No job postings found for company with this ID: ${existingCompany._id}`
    );
  }

  const jobIdToUpdate = jobId;
  if (!company.jobPostings.includes(jobIdToUpdate)) {
    throw new CustomError.NotFoundError(
      `Job with ID ${jobIdToUpdate} does not belong to this company.`
    );
  }

  const updateJob = await Job.findOneAndUpdate(
    {
      _id: jobIdToUpdate,
    },
    {
      title,
      description,
      careerLevel,
      type,
      offeredSalary,
      experience,
      qualification,
      skillRequirements,
      quantity,
      category,
    },
    { new: true, runValidators: true }
  );
  res.status(StatusCodes.OK).json({ updateJob });
};

const deleteJob = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const { jobId } = req.params;
  validateMongoDbId(jobId);

  const existingCompany = await User.findById({ _id: userId });
  const company = await Company.findOne({ user: existingCompany._id });
  if (!existingCompany) {
    throw new CustomError.NotFoundError(
      `Not foud company with this ID: ${userId}`
    );
  }
  if (company.jobPostings.includes(jobId)) {
    company.jobPostings.pop(jobId);
    await company.save();
  }
  await Job.findByIdAndDelete({
    _id: jobId,
  });

  res
    .status(StatusCodes.NO_CONTENT)
    .json({ message: "Delete job successfully" });
};

module.exports = {
  updateProfile,
  uploadLogo,
  getAllCompanies,
  getSingleCompany,
  deleteCompany,
  createJob,
  uploadJobImage,
  updateJob,
  deleteJob,
};
