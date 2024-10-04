const express = require("express");
const router = express.Router();

const {
  updateProfile,
  uploadLogo,
  getAllCompanies,
  getSingleCompany,
  deleteCompany,
  createJob,
  uploadJobImage,
  updateJob,
  deleteJob,
  getAllJobPostingsOfCompany,
} = require("./../controllers/companyController");
const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

router.get("/", getAllCompanies);
router.get("/get-all-job-postings/:companyId", getAllJobPostingsOfCompany);
router.post(
  "/create-job",
  [authenticateUser, authorizePermissions("company")],
  createJob
);
router.post(
  "/upload-logo",
  [authenticateUser, authorizePermissions("company")],
  uploadLogo
);
router.post(
  "/upload-job-image",
  [authenticateUser, authorizePermissions("company")],
  uploadJobImage
);
router.patch(
  "/update-job/:jobId",
  [authenticateUser, authorizePermissions("company")],
  updateJob
);
router.delete(
  "/delete-job/:jobId",
  [authenticateUser, authorizePermissions("company")],
  deleteJob
);
router.get("/:id", getSingleCompany);
router.delete(
  "/:id",
  authenticateUser,
  authorizePermissions("admin"),
  deleteCompany
);

router.patch("/:userId", authenticateUser, updateProfile);

module.exports = router;
