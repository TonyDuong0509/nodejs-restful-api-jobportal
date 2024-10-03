const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide job title"],
    },
    slug: {
      type: String,
      lower: true,
    },
    description: {
      type: String,
      required: [true, "Please provide job description"],
    },
    careerLevel: {
      type: String,
      enum: [
        "Intern",
        "Fresher",
        "Junior",
        "Middle",
        "Senior",
        "Manager",
        "Tech Lead",
      ],
      required: [true, "Please provide career level"],
    },
    type: {
      type: String,
      enum: ["Full time", "Part time", "Remote"],
      required: [true, "Please provide job type"],
    },
    offeredSalary: Number,
    experience: {
      type: String,
      required: [true, "Please provide job experience"],
    },
    qualification: {
      type: String,
      enum: ["University", "College", "Other"],
      required: [true, "Please provide job qualification"],
    },
    skillRequirements: [String],
    deadlineDate: Date,
    location: String,
    quantity: {
      type: Number,
      required: [true, "Please provide number of jobseeker"],
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
