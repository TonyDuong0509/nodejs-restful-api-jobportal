const express = require("express");
const router = express.Router();
const {
  createResume,
  getAllResumes,
  getSingleResume,
  updateResume,
  deleteResume,
  uploadAvatar,
  generateResumePDF,
} = require("./../controllers/resumeController");
const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

router.post(
  "/",
  [authenticateUser, authorizePermissions("admin", "jobseeker")],
  createResume
);
router.post(
  "/upload-avatar",
  [authenticateUser, authorizePermissions("admin", "jobseeker")],
  uploadAvatar
);
router.get(
  "/",
  [authenticateUser, authorizePermissions("admin", "jobseeker")],
  getAllResumes
);
router
  .route("/:resumeId")
  .get(
    [authenticateUser, authorizePermissions("admin", "jobseeker")],
    getSingleResume
  )
  .patch(
    [authenticateUser, authorizePermissions("admin", "jobseeker")],
    updateResume
  )
  .delete(
    [authenticateUser, authorizePermissions("admin", "jobseeker")],
    deleteResume
  );
router.get(
  "/:resumeId/pdf",
  [authenticateUser, authorizePermissions("admin", "jobseeker")],
  generateResumePDF
);
module.exports = router;
