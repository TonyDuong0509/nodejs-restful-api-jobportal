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
    offeredSalary: {
      minSalary: {
        type: Number,
        min: 0,
        required: [true, "Please provide min salary"],
      },
      maxSalary: {
        type: Number,
        min: 0,
        required: [true, "Please provide max salary"],
      },
    },
    experience: {
      type: String,
      enum: [
        "No experience",
        "Less than 1 year",
        "1 to 2 Year(s)",
        "2 to 4 Year(s)",
        "3 to 5 Year(s)",
        "2 Years",
        "3 Years",
        "4 Years",
        "Over 5 Years",
      ],
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
    isFull: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "/uploads/no_image.jpeg",
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: [true, "Please provide job category"],
    },
    company: {
      type: mongoose.Types.ObjectId,
      ref: "Company",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
