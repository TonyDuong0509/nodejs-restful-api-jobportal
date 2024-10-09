const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema(
  {
    jobseeker: {
      type: mongoose.Types.ObjectId,
      ref: "Jobseeker",
      required: true,
    },
    avatar: {
      type: String,
      default: "/uploads/no_image.jpeg",
    },
    personalDetails: {
      fullname: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: String,
      address: String,
      facebook: String,
      github: String,
    },
    education: [
      {
        school: String,
        degree: String,
        startDate: Date,
        endDate: Date,
      },
    ],
    workExperience: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        description: String,
      },
    ],
    skills: [String],
    projects: [
      {
        title: String,
        description: String,
        link: String,
      },
    ],
    certifications: [
      {
        name: String,
        organization: String,
        issueDate: Date,
      },
    ],
    stringUrl: String,
  },
  { timestamps: true }
);

ResumeSchema.pre("save", function (next) {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  // Convert UTC time to Vietnam time (GMT+7)
  this.createdAt = new Date(this.createdAt.getTime() + 7 * 60 * 60 * 1000);
  this.updatedAt = new Date(this.updatedAt.getTime() + 7 * 60 * 60 * 1000);

  next();
});

module.exports = mongoose.model("Resume", ResumeSchema);
