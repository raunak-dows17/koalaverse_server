const mongoose = require("mongoose");

const contributionSchema = mongoose.Schema(
  {
    content: { type: String, required: true },
    storyFor: {
      type: mongoose.Schema.ObjectId,
      ref: "storyData",
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "userData",
      required: true,
    },
    votes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "userData",
      },
    ],
    voteCount: {
      type: Number,
      default: 0,
    },
    isMerged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Contributions = mongoose.model("contributionData", contributionSchema);

module.exports = Contributions;
