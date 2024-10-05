const express = require("express");
const router = express.Router();
const {
  showMe,
  updateProfile,
  uploadAvatar,
  getAllJobseekers,
} = require("./../controllers/jobseekerController");
const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

router.get(
  "/",
  [authenticateUser, authorizePermissions("admin", "company")],
  getAllJobseekers
);
router.get(
  "/showMe",
  [authenticateUser, authorizePermissions("admin", "jobseeker")],
  showMe
);
router.patch(
  "/update-profile",
  [authenticateUser, authorizePermissions("admin", "jobseeker")],
  updateProfile
);
router.post(
  "/upload-avatar",
  [authenticateUser, authorizePermissions("admin", "jobseeker")],
  uploadAvatar
);

module.exports = router;
