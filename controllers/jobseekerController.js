const Jobseeker = require("./../models/jobseekerModel");
const Job = require("./../models/jobModel");
const { StatusCodes } = require("http-status-codes");
const CustomErr = require("./../errors");
const { queryHelper } = require("./../utils/index");

const showMe = async (req, res) => {};

const updateProfile = async (req, res) => {};

const uploadAvatar = async (req, res) => {};

module.exports = {
  showMe,
  updateProfile,
  uploadAvatar,
};
