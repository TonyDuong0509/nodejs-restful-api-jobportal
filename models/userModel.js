const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide name field"],
      minlength: 6,
      maxlength: 50,
    },
    phone: {
      type: String,
      required: [true, "Please provide phone field"],
    },
    address: {
      type: String,
      required: [true, "Please provide address field"],
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Please provide email field"],
      trim: true,
      lowercase: true,
      unique: true,
      validate: [isEmail, "Invalid email"],
    },
    about: {
      type: String,
      required: [true, "Please provide about field"],
    },
    password: {
      type: String,
      required: [true, "Please provide password field"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["jobseeker", "company", "admin"],
      required: true,
    },
    isLogged: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    verified: Date,
    passwordToken: String,
    passwordTokenExpirationDate: Date,
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.pre("save", function () {
  const now = new Date();
  this.updatedAt = now;
  if (!this.createdAt) {
    this.createdAt = now;
  }

  // Convert UTC time to Vietnam time (GMT+7)
  this.createdAt = new Date(this.createdAt.getTime() + 7 * 60 * 60 * 1000);
  this.updatedAt = new Date(this.updatedAt.getTime() + 7 * 60 * 60 * 1000);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

module.exports = mongoose.model("User", UserSchema);
