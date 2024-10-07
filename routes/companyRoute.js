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
  showMe,
} = require("./../controllers/companyController");
const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

router.get("/", getAllCompanies);
router.get("/get-all-job-postings/:companyId", getAllJobPostingsOfCompany);
router.get(
  "/showMe",
  [authenticateUser, authorizePermissions("admin", "company")],
  showMe
);
router.post(
  "/create-job",
  [authenticateUser, authorizePermissions("admin", "company")],
  createJob
);
router.post(
  "/upload-logo",
  [authenticateUser, authorizePermissions("admin", "company")],
  uploadLogo
);
router.post(
  "/upload-job-image",
  [authenticateUser, authorizePermissions("admin", "company")],
  uploadJobImage
);
router.patch(
  "/update-profile",
  [authenticateUser, authorizePermissions("admin", "company")],
  updateProfile
);
router.patch(
  "/update-job/:jobId",
  [authenticateUser, authorizePermissions("admin", "company")],
  updateJob
);
router.delete(
  "/delete-job/:jobId",
  [authenticateUser, authorizePermissions("admin", "company")],
  deleteJob
);
router.get("/:id", getSingleCompany);
router.delete(
  "/:id",
  authenticateUser,
  authorizePermissions("admin"),
  deleteCompany
);

module.exports = router;
