const express = require("express");
const router = express.Router();
const { getAllJobs, getSingleJob } = require("./../controllers/jobController");

router.get("/", getAllJobs);
router.get("/:id", getSingleJob);

module.exports = router;
