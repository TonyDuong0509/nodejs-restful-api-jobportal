const express = require("express");
const router = express.Router();
const { showMe } = require("./../controllers/jobseekerController");
const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

module.exports = router;
