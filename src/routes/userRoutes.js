const UserController = require("../controller/UserController");
const AuthMiddleware = require("../middleware/AuthMiddleware");

const express = require("express");
const router = express.Router();

router.post("/register", UserController.userRegister);
router.post("/login", UserController.userLogin);
router.get("/user", AuthMiddleware, UserController.userProfile);
router.put("/user", AuthMiddleware, UserController.editUserProfile);
router.put("/updatePassword", AuthMiddleware, UserController.changePassword);
router.get(
  "/checkUsername",
  express.urlencoded(),
  UserController.checkUsername
);
router.get("/checkEmail", express.urlencoded(), UserController.checkEmail);

module.exports = router;
