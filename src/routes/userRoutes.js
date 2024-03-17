const UserController = require("../controller/UserController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

const express = require("express");
const upload = require("../middleware/uploadMedia");
const router = express.Router();

router.post(
  "/register",
  upload.single("profilePicture"),
  UserController.userRegister
);

router.post("/login", UserController.userLogin);

router.get("/user", AuthMiddleware, UserController.userProfile);
router.put(
  "/user",
  AuthMiddleware,
  upload.single("profilePicture"),
  UserController.editUserProfile
);

router.put("/updatePassword", AuthMiddleware, UserController.changePassword);

router.get(
  "/checkUsername",
  express.urlencoded(),
  UserController.checkUsername
);

router.get("/checkEmail", express.urlencoded(), UserController.checkEmail);

module.exports = router;
