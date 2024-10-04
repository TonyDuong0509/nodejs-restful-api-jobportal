const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      default: "/uploads/no_image.jpeg",
    },
    employee: Number,
    website: String,
    jobPostings: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Job",
        default: null,
      },
    ],
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

CompanySchema.pre("save", function (next) {
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

module.exports = mongoose.model("Company", CompanySchema);
