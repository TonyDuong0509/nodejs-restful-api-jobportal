const User = require("./../models/userModel");
const Token = require("./../models/tokenModel");
const Company = require("./../models/companyModel");
const Jobseeker = require("./../models/jobseekerModel");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("./../errors");
const crypto = require("crypto");
const {
  attachCookiesToResponse,
  sendVerificationEmail,
  createTokenUser,
} = require("./../utils");

const register = async (req, res) => {
  const { name, phone, address, email, about, password, role } = req.body;
  const emailAlreadyExist = await User.findOne({ email: email });
  if (emailAlreadyExist) {
    throw new CustomError.BadRequestError(
      "Email already exist, please try another email"
    );
  }

  // Set first account is Admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const userRole = isFirstAccount ? "admin" : role;
  if (!isFirstAccount && (!role || !["jobseeker", "company"].includes(role))) {
    throw new CustomError.BadRequestError("Please provide a valid role");
  }

  const verificationToken = crypto.randomBytes(40).toString("hex");

  const user = await User.create({
    name,
    phone,
    address,
    email,
    about,
    password,
    role: userRole,
    verificationToken,
  });

  if (role === "company") {
    await Company.create({ user: user._id });
  }

  if (role === "jobseeker") {
    await Jobseeker.create({ user: user._id });
  }

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
  });

  res
    .status(StatusCodes.CREATED)
    .json({ message: "Success, please check your email to verify account" });
};

const verifyEmail = async (req, res) => {
  const { email, verificationToken } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new CustomError.Unauthenticated(
      "Email is not correct, please try again"
    );
  }
  if (user.verificationToken !== verificationToken) {
    throw new CustomError.Unauthenticated("Verification Failed");
  }
  user.isVerified = true;
  user.verified = new Date().getTime() + 1000 * 60 * 60 * 7;
  user.verificationToken = "";

  await user.save();

  res.status(StatusCodes.OK).json({
    message: "Email is verified",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new CustomError.Unauthenticated("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.Unauthenticated("Invalid Credentials");
  }
  if (!user.isVerified) {
    throw new CustomError.Unauthenticated("Please verify your email");
  }

  const tokenUser = createTokenUser(user);

  let refreshToken = "";

  const existingToken = await Token.findOne({ user: user._id });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.Unauthenticated("Invalid Credentials");
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString("hex");
  const userAgent = req.headers["user-agent"];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };
  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "User logged out !" });
};

module.exports = { register, verifyEmail, login, logout };
