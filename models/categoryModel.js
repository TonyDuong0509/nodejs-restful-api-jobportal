const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide name category"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps }
);

module.exports = mongoose.model("Category", CategorySchema);
