const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    jobseeker: {
      type: mongoose.Types.ObjectId,
      ref: "Jobseeker",
      required: true,
    },
    job: {
      type: mongoose.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected", "Interviewing", "Hired"],
      default: "pending",
    },
  },
  { timestamps: true }
);

ApplicationSchema.pre("save", function (next) {
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

module.exports = mongoose.model("Application", ApplicationSchema);
