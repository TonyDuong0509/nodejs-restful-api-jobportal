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

module.exports = mongoose.model("Jobseeker", JobseekerSchema);
