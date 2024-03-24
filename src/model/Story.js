const mongoose = require("mongoose");

const storySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: [
      {
        text: {
          type: String,
          required: true,
        },
        author: {
          type: mongoose.Schema.ObjectId,
          ref: "userData",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "userData",
      required: true,
    },
    contributions: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "contributionData",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Story = mongoose.model("storyData", storySchema);

module.exports = Story;
