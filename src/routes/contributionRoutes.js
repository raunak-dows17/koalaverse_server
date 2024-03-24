const ContributionController = require("../controller/contributionController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

const router = require("express").Router();

router.post("/:storyId", AuthMiddleware, ContributionController.contribute);
router.post(
  "/:contributionId/vote",
  AuthMiddleware,
  ContributionController.voteContributions
);

module.exports = router;
