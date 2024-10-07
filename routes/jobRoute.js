const express = require("express");
const router = express.Router();
const {
  getAllJobs,
  getSingleJob,
  getAllJobsByCategory,
} = require("./../controllers/jobController");
const {
  authenticateUser,
  optionalAutneticatedUser,
} = require("./../middlewares/authentication");

router.get("/", optionalAutneticatedUser, getAllJobs);
router.get(
  "/get-jobs-by-category",
  optionalAutneticatedUser,
  getAllJobsByCategory
);
router.get("/:id", optionalAutneticatedUser, getSingleJob);

module.exports = router;
