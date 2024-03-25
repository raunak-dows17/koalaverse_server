const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipients: {
      type: mongoose.Schema.ObjectId,
      ref: "userData",
    },
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["read", "unread"],
      default: "unread",
    },
  },
  {
    timestamps: true,
  }
);

const Notification = new mongoose.model("notificationData", notificationSchema);

module.exports = Notification;
