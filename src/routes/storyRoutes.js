const StoryController = require("../controller/StoryController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

const router = require("express").Router();

router.get("/", AuthMiddleware, StoryController.getStroies);
router.get("/:_id", AuthMiddleware, StoryController.getStroiesById);
router.post("/", AuthMiddleware, StoryController.postStory);
router.put(
  "/markascomplete/:storyId",
  AuthMiddleware,
  StoryController.markAsCompleted
);
router.put("/:storyId", AuthMiddleware, StoryController.updateStory);
router.put(
  "/:storyId/contribution/:contributionId/merge",
  AuthMiddleware,
  StoryController.mergeContributionToStory
);
router.delete("/:storyId", AuthMiddleware, StoryController.deleteStory);

module.exports = router;
