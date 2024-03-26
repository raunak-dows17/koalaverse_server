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

      if (String(story.author) === String(userId)) {
        return res.status(400).json({
          message: "You cannot contribute on your own stroy",
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

  getContributionById: async (req, res) => {
    try {
      const { contributionId } = req.params;

      const contribution = await Contributions.findById(
        contributionId
      ).populate([
        {
          path: "storyFor",
          select: "title",
        },
        {
          path: "author",
          select: "name username profileImage",
        },
        {
          path: "votes",
          select: "name username profileImage",
        },
      ]);

      if (!contribution) {
        return res.status(404).json({
          message: "Contribution not found",
        });
      }

      return res.status(200).json({
        contribution,
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
        contribution.voteCount -= 1;
        contribution.votes.pop(userId);
        await contribution.save();
      } else {
        contribution.voteCount += 1;
        contribution.votes.push(userId);
        await contribution.save();
      }

      return res.status(200).json({
        message: contribution.votes.includes(userId)
          ? "vote removed successfully"
          : "vote recorded successfully",
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
      const { contributionId } = req.params;
      const { content } = req.body;

      const user = await User.findById(userId);
      const contribution = await Contributions.findById(contributionId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!contribution) {
        return res.status(404).json({
          message: "Contribution not found",
        });
      }

      if (String(contribution.author) !== String(userId)) {
        return res.status(403).json({
          message: "You are not allowed to edit this contribution",
        });
      }

      if (contribution.isMerged) {
        return res.status(400).json({
          message: "Your contribution is already merged...",
        });
      }

      contribution.content = content;
      contribution.save();

      return res.status(201).json({
        message: "Successfully updated your contribution",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  deleteContribution: async (req, res) => {
    try {
      const { userId } = req;
      const { contributionId } = req.params;

      const user = await User.findById(userId);
      const contribution = await Contributions.findById(contributionId);
      const story = await Contributions.findById(contribution.storyFor);

      console.log(story);

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

      if (String(contribution.author) !== String(userId)) {
        return res.status(403).json({
          message: "You are not allowed to delete this contribution",
        });
      }

      await Contributions.findByIdAndDelete(contributionId);
      user.contributions.pop(contributionId);
      story.contributions.pop(contributionId);

      return res.status(200).json({
        message: "Contribution deleted successfully",
      });
    } catch (error) {}
  },
};

module.exports = ContributionController;
