const mongoose = require("mongoose");

const JobseekerSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
      enum: ["Male", "Femail", "Other"],
      required: true,
    },
    birthday: Date,
    education: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "/uploads/no_image.jpeg",
    },
    skill: {
      type: [String],
      required: true,
    },
    experience: [
      {
        company: {
          type: String,
          required: true,
        },
        position: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          required: true,
        },
        endDate: Date,
        description: {
          type: String,
          required: true,
        },
      },
    ],
    resume: {
      type: String,
      default: null,
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

JobseekerSchema.pre("save", function (next) {
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

module.exports = mongoose.model("Jobseeker", JobseekerSchema);
