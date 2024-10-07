const express = require("express");
const router = express.Router();
const {
  showMe,
  updateProfile,
  uploadAvatar,
  getAllJobseekers,
  getSingleJobseeker,
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
router.get(
  "/:jobseekerId",
  [authenticateUser, authorizePermissions("admin", "company")],
  getSingleJobseeker
);

module.exports = router;
