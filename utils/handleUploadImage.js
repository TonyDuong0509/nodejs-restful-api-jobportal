const Company = require("./../models/companyModel");
const Job = require("./../models/jobModel");
const User = require("./../models/userModel");
const Jobseeker = require("./../models/jobseekerModel");
const Resume = require("./../models/resumeModel");
const fs = require("fs");

const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const path = require("path");
const validateMongoDbId = require("./validateMongoDbId");

const handleUploadImage = async (req, res, pathFolder, model) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No File Uploaded");
  }
  const imageInfo = req.files.image;
  if (!imageInfo.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }

  const maxSize = 1024 * 1024;
  if (imageInfo.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload image size smaller 1MB"
    );
  }

  const imagePath = path.join(
    __dirname,
    `./../public/uploads/${pathFolder}/` + imageInfo.name
  );

  let existingImageFilePath;

  if (model === Company) {
    const { userId } = req.user;
    const existingCompany = await model.findOne({ user: userId });
    if (!existingCompany) {
      throw new CustomError.NotFoundError(
        `Not found company with this ID: ${userId}`
      );
    }

    existingImageFilePath = existingCompany.logo
      ? path.join(__dirname, `./../public${existingCompany.logo}`)
      : null;

    await model.findOneAndUpdate(
      { user: userId },
      {
        logo: `/uploads/${pathFolder}/${imageInfo.name}`,
      },
      { new: true }
    );
  }

  if (model === Jobseeker) {
    const { userId } = req.user;
    const existingJobseeker = await model.findOne({ user: userId });
    if (!existingJobseeker) {
      throw new CustomError.NotFoundError(
        `Not found user with this ID: ${userId}`
      );
    }

    existingImageFilePath = existingJobseeker.avatar
      ? path.join(__dirname, `./../public${existingJobseeker.avatar}`)
      : null;

    await model.findOneAndUpdate(
      { user: userId },
      {
        avatar: `/uploads/${pathFolder}/${imageInfo.name}`,
      },
      {
        new: true,
      }
    );
  }

  if (model === Resume) {
    const { userId } = req.user;
    validateMongoDbId(userId);
    const { resumeId } = req.body;
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
        `Not found jobseeker with this ID: ${jobseeker._id}`
      );
    }

    const resume = await Resume.findById({ _id: resumeId });
    if (!resume) {
      throw new CustomError.NotFoundError(
        `Not found resume with this ID: ${jobseeker._id}`
      );
    }
    existingImageFilePath = resume.avatar
      ? path.join(__dirname, `./../public/${resume.avatar}`)
      : null;

    await model.findOneAndUpdate(
      { _id: resume._id },
      {
        avatar: `/uploads/${pathFolder}/${imageInfo.name}`,
      },
      { new: true }
    );
  }

  if (model === Job) {
    const { jobId } = req.body;
    const existingCompany = await User.findById({ _id: req.user.userId });
    if (!existingCompany) {
      throw new CustomError.NotFoundError(
        `Not found company with this ID: ${req.user.userId}`
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

    const job = await Job.findById({ _id: jobIdToUpdate });
    existingImageFilePath = job.image
      ? path.join(__dirname, `./../public${job.image}`)
      : null;

    await model.findOneAndUpdate(
      { _id: jobIdToUpdate },
      {
        image: `/uploads/${pathFolder}/${imageInfo.name}`,
      },
      { new: true }
    );
  }

  if (existingImageFilePath) {
    try {
      fs.unlinkSync(existingImageFilePath);
    } catch (error) {
      console.error(`Error while deleting old image ${error.message}`);
    }
  }

  await imageInfo.mv(imagePath);

  res.status(StatusCodes.OK).json({
    message: "Upload image successfully",
    image: `/uploads/${pathFolder}/${imageInfo.name}`,
  });
};

module.exports = handleUploadImage;
