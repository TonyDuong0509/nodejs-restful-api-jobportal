const User = require("./../models/userModel");
const Jobseeker = require("./../models/jobseekerModel");
const Job = require("./../models/jobModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const {
  validateMongoDbId,
  handleUploadImage,
  queryHelper,
} = require("./../utils/index");

const getAllJobseekers = async (req, res) => {
  const populateOptions = {
    path: "user",
    select: "name phone address about -_id",
  };
  const selectedFields = "-_id";
  const { docs, page, limit } = await queryHelper(
    Jobseeker,
    req,
    populateOptions,
    selectedFields
  );

  res.status(StatusCodes.OK).json({ jobseekers: docs, count: docs.length });
};

const showMe = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const existingJobseeker = await User.findById({ _id: userId });
  if (!existingJobseeker) {
    throw new CustomError.NotFoundError(
      `Not found user with this ID: ${userId}`
    );
  }
  const jobseeker = await Jobseeker.findOne({
    user: existingJobseeker._id,
  })
    .populate({
      path: "user",
      select: "name phone address email about -_id",
    })
    .select("-_id");
  if (!jobseeker) {
    throw new CustomError.NotFoundError(
      `Not found company with this ID: ${existingJobseeker._id}`
    );
  }
  res.status(StatusCodes.OK).json({ jobseeker });
};

const updateProfile = async (req, res) => {
  const { userId } = req.user;
  validateMongoDbId(userId);
  const { gender, birthday, education, skills, experience } = req.body;
  const existingJobseeker = await User.findById({ _id: userId });
  const jobseeker = await Jobseeker.findOneAndUpdate(
    {
      user: existingJobseeker._id,
    },
    {
      gender,
      birthday,
      education,
      skills,
      experience,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate({
      path: "user",
      select: "name phone address email about -_id",
    })
    .select("-_id");
  res.status(StatusCodes.OK).json({ jobseeker });
};

const uploadAvatar = async (req, res) => {
  await handleUploadImage(req, res, "jobseeker", Jobseeker);
};

module.exports = {
  showMe,
  updateProfile,
  uploadAvatar,
  getAllJobseekers,
};
