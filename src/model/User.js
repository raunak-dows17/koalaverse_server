const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    image: { type: String },
    name: { type: String },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: { type: String },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("userData", userSchema);

module.exports = User;