const mongoose = require("mongoose");
const { isEmail } = require("validator");

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
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
