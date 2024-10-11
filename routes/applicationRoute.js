const express = require("express");
const router = express.Router();
const {
  applyJob,
  getAllApplicationsJOfobseeker,
  getAllApplicationsOfCompany,
  companyChangeStatusApplication,
  deleteApplication,
  getSingleApplication,
} = require("./../controllers/applicationController");
const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

router.post(
  "/apply-job",
  [authenticateUser, authorizePermissions("jobseeker")],
  applyJob
);
router.get(
  "/jobseeker-get-all-applications",
  [authenticateUser, authorizePermissions("admin", "jobseeker")],
  getAllApplicationsJOfobseeker
);
router.get(
  "/company-get-all-applications",
  [authenticateUser, authorizePermissions("admin", "company")],
  getAllApplicationsOfCompany
);
router.patch(
  "/change-status/:applicationId",
  [authenticateUser, authorizePermissions("admin", "company")],
  companyChangeStatusApplication
);

router
  .route("/:applicationId")
  .get(
    [authenticateUser, authorizePermissions("admin", "company", "jobseeker")],
    getSingleApplication
  )
  .delete(
    [authenticateUser, authorizePermissions("admin", "company")],
    deleteApplication
  );

module.exports = router;
