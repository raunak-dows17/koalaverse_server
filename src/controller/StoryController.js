const Contributions = require("../model/Contributions");
const Story = require("../model/Story");
const User = require("../model/User");

const StoryController = {
  getStroies: async (req, res) => {
    try {
      const stories = await Story.find({})
        .populate({
          path: "author",
          select: "name username",
        })
        .populate({
          path: "contributions",
          populate: [
            { path: "author", select: "name username" },
            {
              path: "votes",
              select: "name username",
            },
          ],
        });

      return res.status(200).json({
        message: "Strories",
        stories,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  postStory: async (req, res) => {
    try {
      const { title, content } = req.body;
      const _id = req.userId;

      const user = await User.findOne({ _id });

      if (!user) {
        return res.status(401).json({
          message: "You need to login to post a story",
        });
      }

      let storyContent;
      if (typeof content === "string") {
        storyContent = [{ text: content, author: _id }];
      } else if (Array.isArray(content)) {
        storyContent = content.map((text) => ({ text, author: _id }));
      } else {
        return res.status(400).json({
          message: "Invalid content format",
        });
      }

      const newStory = new Story({
        title,
        content: storyContent,
        author: user,
      });

      await newStory.save();

      await User.findByIdAndUpdate(_id, {
        $push: {
          stories: newStory,
        },
      });

      return res.status(201).json({
        message: "Story saved successfully",
        storyId: newStory._id,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  getStroiesById: async (req, res) => {
    try {
      const { _id } = req.params;

      const story = await Story.findById(_id)
        .populate({
          path: "author",
          select: "name username",
        })
        .populate({
          path: "contributions",
          populate: [
            {
              path: "author",
              select: "name username",
            },
            {
              path: "votes",
              select: "name username",
            },
          ],
        });

      if (!story) {
        return res.status(404).json({
          message: "Story not found",
        });
      }

      return res.status(200).json(story);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  mergeContributionToStory: async (req, res) => {
    try {
      const { storyId, contributionId } = req.params;
      const { userId } = req;

      const contribution = await Contributions.findById(contributionId);
      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
      }

      if (!contribution) {
        return res.status(404).json({
          message: "Contribution not found",
        });
      }

      const story = await Story.findById(storyId);
      if (String(story.author) !== String(userId)) {
        return res.status(403).json({
          message: "You are not authorized to merge this contribution",
        });
      }

      const existingContributionIndex = story.content.findIndex(
        (item) => item.text === contribution.content
      );

      if (existingContributionIndex !== -1) {
        story.content.splice(existingContributionIndex, 1);
        contribution.isMerged = false;
        await contribution.save();
      } else {
        story.content.push({
          text: contribution.content,
          author: contribution.author,
          createdAt: contribution.createdAt,
        });
        contribution.isMerged = true;
        await contribution.save();
      }

      await story.save();

      return res.status(200).json({
        message: contribution.isMerged
          ? "Contribution merged successfully"
          : "Contributon removed successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  updateStory: async (req, res) => {
    try {
      const { storyId } = req.params;
      const { title, content } = req.body;
      const { userId } = req;

      const user = await User.findOne({ userId });

      if (!user) {
        return res.status(401).json({
          message: "You need to login to post a story",
        });
      }

      let storyContent;
      if (typeof content === "string") {
        storyContent = [{ text: content, author: userId }];
      } else if (Array.isArray(content)) {
        storyContent = content.map((text) => ({ text, author: userId }));
      } else {
        return res.status(400).json({
          message: "Invalid content format",
        });
      }

      await Story.findByIdAndUpdate(storyId, {
        title,
        content: storyContent,
        author: user,
      });

      await User.findByIdAndUpdate(userId, {
        $push: {
          stories: newStory,
        },
      });

      return res.status(201).json({
        message: "Story updated successfully",
        storyId,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  deleteStory: async (req, res) => {},
};

module.exports = StoryController;
