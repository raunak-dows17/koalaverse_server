const ContributionController = require("../controller/contributionController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

const router = require("express").Router();

router.get("/:contributionId", ContributionController.getContributionById);
router.post("/:storyId", AuthMiddleware, ContributionController.contribute);
router.put(
  "/:contributionId",
  AuthMiddleware,
  ContributionController.updateContribution
);
router.post(
  "/:contributionId/vote",
  AuthMiddleware,
  ContributionController.voteContributions
);
router.delete(
  "/:contributionId",
  AuthMiddleware,
  ContributionController.deleteContribution
);

module.exports = router;
