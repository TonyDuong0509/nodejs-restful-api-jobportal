const Company = require("./../models/companyModel");
const User = require("./../models/userModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const {
  validateMongoDbId,
  checkPermissions,
  queryHelper,
} = require("./../utils/index");
const path = require("path");

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
  if (!req.files) {
    throw new CustomError.BadRequestError("No File Uploaded");
  }
  const companyLogo = req.files.image;
  if (!companyLogo.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }

  const maxSize = 1024 * 1024;
  if (companyLogo.size > maxSize) {
    throw new CustomError.BadRequestError(
      "Please upload image size smaller 1MB"
    );
  }

  const imagePath = path.join(
    __dirname,
    "./../public/uploads/company/" + companyLogo.name
  );

  await companyLogo.mv(imagePath);

  const company = await Company.findOneAndUpdate(
    { user: req.user.userId },
    {
      logo: `/uploads/company/${companyLogo.name}`,
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({
    message: "Upload image successfully",
    image: `/uploads/company/${companyLogo.name}`,
  });
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

module.exports = {
  updateProfile,
  uploadLogo,
  getAllCompanies,
  getSingleCompany,
  deleteCompany,
};
