const Application = require("./../models/applicationModel");
const User = require("./../models/userModel");
const Jobseeker = require("./../models/jobseekerModel");
const Company = require("./../models/companyModel");
const Job = require("./../models/jobModel");
const Resume = require("./../models/resumeModel");
const CustomError = require("./../errors");
const { StatusCodes } = require("http-status-codes");
const { validateMongoDbId } = require("./../utils/index");
const { application } = require("express");

const applyJob = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const { jobId, resumeId } = req.body;
  validateMongoDbId(jobId);
  validateMongoDbId(resumeId);
  const existingJobseeker = await User.findById({ _id: userId });
  if (!existingJobseeker) {
    throw new CustomError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }
  const jobseeker = await Jobseeker.findOne({ user: existingJobseeker._id });
  if (!jobseeker) {
    throw new CustomError.NotFoundError(
      `Not found jobseeker with this ID: ${existingJobseeker._id}`
    );
  }

  const job = await Job.findById({ _id: jobId });
  if (!job) {
    throw new CustomError.NotFoundError(`Not found job with this ID: ${jobId}`);
  }
  const resume = await Resume.findOne({
    _id: resumeId,
    jobseeker: jobseeker._id,
  });
  if (!resume) {
    throw new CustomError.NotFoundError(
      `Resume not exisit or This resume is not belong to jobseeker`
    );
  }

  const existingApplication = await Application.findOne({
    jobseeker: jobseeker._id,
    job: jobId,
  });
  if (existingApplication) {
    throw new CustomError.BadRequestError("You applied this job");
  }

  const application = await Application.create({
    jobseeker: jobseeker._id,
    job: jobId,
    resume: resumeId,
    company: job.company,
  });

  res.status(StatusCodes.CREATED).json({ application });
};

const getAllApplicationsJOfobseeker = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const existingUser = await User.findById({ _id: userId });
  if (!existingUser) {
    throw new CustomError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }
  const jobseeker = await Jobseeker.findOne({ user: existingUser._id });
  if (!jobseeker) {
    throw new CustomError.NotFoundError(
      `Not found jobseeker with this ID: ${existingUser._id}`
    );
  }

  const modelsCount = await Application.countDocuments({
    jobseeker: jobseeker._id,
  });

  const page = req.query.page || 1;
  const limit = req.query.limit || 6;
  const skip = (page - 1) * limit;

  if (skip >= modelsCount) {
    throw new CustomError.BadRequestError("The page does not exist");
  }

  const totalPages = Math.ceil(modelsCount / limit);

  const applications = await Application.find({
    jobseeker: jobseeker._id,
  })
    .populate({
      path: "job",
      select: "title",
    })
    .populate({
      path: "company",
      populate: {
        path: "user",
        select: "name -_id",
      },
    })
    .select("-_id");

  const result = applications.map((app) => ({
    jobTitle: app.job.title,
    companyName: app.company.user.name,
    status: app.status,
  }));

  res
    .status(StatusCodes.OK)
    .json({ applications: result, count: result.length, totalPages });
};

const getAllApplicationsOfCompany = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const existingUser = await User.findById({ _id: userId });
  if (!existingUser) {
    throw new CustomError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }
  const company = await Company.findOne({ user: existingUser._id });
  if (!company) {
    throw new CustomError.NotFoundError(
      `Not found company with this ID: ${existingUser._id}`
    );
  }

  const modelsCount = await Application.countDocuments({
    company: company._id,
  });

  const page = req.query.page || 1;
  const limit = req.query.limit || 6;
  const skip = (page - 1) * limit;

  if (skip >= modelsCount) {
    throw new CustomError.BadRequestError("The page does not exist");
  }

  const totalPages = Math.ceil(modelsCount / limit);

  const applications = await Application.find({
    company: company._id,
  })
    .populate({
      path: "job",
      select: "title",
    })
    .populate({
      path: "jobseeker",
      select: "-_id",
      populate: {
        path: "user",
        select: "name email phone",
      },
    })
    .populate({
      path: "resume",
      select: "stringUrl",
    })
    .select("-_id -company")
    .skip(skip)
    .limit(limit);

  const result = applications.map((app) => ({
    jobTitle: app.job.title,
    jobseekerName: app.jobseeker.user.name,
    jobseekerEmail: app.jobseeker.user.email,
    jobseekerPhone: app.jobseeker.user.phone,
    status: app.status,
    resumeDownloadLink: `${req.protocol}://${req.get("host")}${
      app.resume.stringUrl
    }`,
  }));
  res
    .status(StatusCodes.OK)
    .json({ applications: result, count: result.length, totalPages });
};

const companyChangeStatusApplication = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const { applicationId } = req.params;
  validateMongoDbId(applicationId);
  const { status } = req.body;
  const existingCompany = await User.findById({ _id: userId });
  if (!existingCompany) {
    throw new CustomError.NotFoundError(
      `Not foud user with this ID: ${userId}`
    );
  }
  const company = await Company.findOne({ user: existingCompany._id });
  if (!company) {
    throw new CustomError.NotFoundError(
      `Not found company with this ID: ${existingCompany._id}`
    );
  }

  const application = await Application.findOneAndUpdate(
    {
      _id: applicationId,
      company: company._id,
    },
    {
      status: status,
    },
    {
      new: true,
    }
  );

  if (!application) {
    throw new CustomError.NotFoundError(
      "Not found application or this application not belongs to your company"
    );
  }

  const jobs = await Job.find({ _id: application.job });
  for (const job of jobs) {
    const hiredCount = await Application.countDocuments({
      job: job._id,
      status: "Hired",
    });

    if (hiredCount === job.quantity) {
      await Job.findByIdAndUpdate(
        { _id: job._id },
        { isFull: true },
        { new: true }
      );
    }
  }

  res
    .status(StatusCodes.OK)
    .json({ message: "Change status successfully !", status });
};

const deleteApplication = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const { applicationId } = req.params;
  validateMongoDbId(applicationId);

  const existingCompany = await User.findById({ _id: userId });
  if (!existingCompany) {
    throw new CustomError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }
  const company = await Company.findOne({ user: existingCompany._id });
  if (!company) {
    throw new CustomError.NotFoundError(
      `Not found company with this ID: ${existingCompany._id}`
    );
  }

  const application = await Application.findById({
    _id: applicationId,
  });
  if (
    !application ||
    application.company.toString() !== company._id.toString()
  ) {
    throw new CustomError.NotFoundError(
      "Not found application or this application not belongs to your company"
    );
  }

  if (application.status === "Hired") {
    const job = await Job.findByIdAndDelete({ _id: application.job });
    if (!job) {
      throw new CustomError.NotFoundError(
        `Not found job with this ID: ${application.job}`
      );
    }
    await application.deleteOne({ _id: applicationId });
  } else {
    throw new CustomError.BadRequestError(
      "Can't delete this application because it not hired"
    );
  }

  res
    .status(StatusCodes.NO_CONTENT)
    .json({ message: "Delete Application successfully !" });
};

module.exports = {
  applyJob,
  getAllApplicationsJOfobseeker,
  getAllApplicationsOfCompany,
  companyChangeStatusApplication,
  deleteApplication,
};
