const Contributions = require("../model/Contributions");
const Story = require("../model/Story");
const User = require("../model/User");

const ContributionController = {
  contribute: async (req, res) => {
    try {
      const userId = req.userId;
      const { content } = req.body;
      const { storyId } = req.params;

      const user = await User.findOne({ _id: userId });
      const story = await Story.findOne({ _id: storyId });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      if (!story) {
        return res.status(404).json({
          message: "Story not found",
        });
      }

      if (story.isCompleted) {
        return res.status(400).json({
          message: "You cannot contribute on a completed story",
        });
      }

      const newContribution = new Contributions({
        content,
        storyFor: story,
        author: user,
      });

      await newContribution.save();

      await User.findByIdAndUpdate(userId, {
        $push: {
          contributions: newContribution,
        },
      });

      await Story.findByIdAndUpdate(storyId, {
        $push: {
          contributions: newContribution,
        },
      });

      return res.status(201).json({
        message: "Contribution Done",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  voteContributions: async (req, res) => {
    try {
      const { contributionId } = req.params;
      const userId = req.userId;

      const user = await User.findById(userId);
      const contribution = await Contributions.findById(contributionId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (!contribution) {
        return res.status(404).json({
          message: "Contribution not found",
        });
      }

      if (contribution.votes.includes(userId)) {
        return res.status(400).json({
          message: "User have already voted to this contribution",
        });
      }

      contribution.voteCount += 1;
      contribution.votes.push(userId);
      await contribution.save();

      return res.status(200).json({
        message: "vote recorded successfully",
        voteCount: contribution.voteCount,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  updateContribution: async (req, res) => {
    try {
      const { userId } = req;
    } catch (error) {}
  },

  deleteContribution: async (req, res) => {
    try {
      const { userId } = req;
    } catch (error) {}
  },
};

module.exports = ContributionController;
