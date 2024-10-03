const express = require("express");
const router = express.Router();

const {
  updateProfile,
  uploadLogo,
  getAllCompanies,
  getSingleCompany,
  deleteCompany,
} = require("./../controllers/companyController");
const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

router.get("/", getAllCompanies);
router.get("/:id", getSingleCompany);
router.delete(
  "/:id",
  authenticateUser,
  authorizePermissions("admin"),
  deleteCompany
);
router.post(
  "/upload-logo",
  [authenticateUser, authorizePermissions("company")],
  uploadLogo
);
router.patch("/:userId", authenticateUser, updateProfile);

module.exports = router;
