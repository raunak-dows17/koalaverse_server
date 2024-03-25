const StoryController = require("../controller/StoryController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

const router = require("express").Router();

router.get("/", StoryController.getStroies);
router.get("/:_id", StoryController.getStroiesById);
router.post("/", AuthMiddleware, StoryController.postStory);
router.put("/:storyId", AuthMiddleware, StoryController.markAsCompleted);
router.put("/:storyId", AuthMiddleware, StoryController.updateStory);
router.put(
  "/:storyId/contribution/:contributionId/merge",
  AuthMiddleware,
  StoryController.mergeContributionToStory
);

module.exports = router;
