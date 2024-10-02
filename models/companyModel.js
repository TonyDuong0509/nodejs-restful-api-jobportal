const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      default: "/uploads/no_image.jpeg",
    },
    employee: Number,
    website: String,
    jobPostings: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
      default: null,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps }
);

module.exports = mongoose.model("Company", CompanySchema);
