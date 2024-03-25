const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    profileImage: { type: String },
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
    stories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "storyData",
      },
    ],
    contributions: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "contributionData",
      },
    ],
    notifications: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "notificationData",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("userData", userSchema);

module.exports = User;
