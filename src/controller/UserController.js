const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("../../config/cloudinary");
const streamify = require("streamifier");

const UserController = {
  userRegister: async (req, res) => {
    try {
      const { name, username, email, password, phoneNumber } = req.body;
      const existingEmail = await User.findOne({ email });
      const existingUsername = await User.findOne({ username });

      if (existingEmail || existingUsername) {
        res.status(401).send("User already exists");
      } else {
        const hashedPassword = await bcrypt.hash(password, 7);

        const imageBuffer = req.file.buffer;
        const uploadOptions = {
          folder: "tv_profileImages",
          public_id: username,
        };
        const uploadedImage = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) throw new Error(error);
              else return resolve(result);
            }
          );
          streamify.createReadStream(imageBuffer).pipe(uploadStream);
        });

        const newUser = new User({
          profileImage: uploadedImage.secure_url,
          name,
          username,
          email,
          password: hashedPassword,
          phoneNumber,
        });
        await newUser.save();

        const payload = {
          userId: newUser._id,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET);

        res.status(201).send({
          message: "User registered successfully",
          token,
        });
      }
    } catch (error) {
      console.error(error?.message);
      res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },

  userLogin: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
      } else {
        const matchPassword = await bcrypt.compare(password, user.password);

        if (!matchPassword) {
          res.status(401).json({
            message: "Invalid Username or Password",
          });
        } else {
          const payload = {
            userId: user._id,
          };

          const token = jwt.sign(payload, process.env.JWT_SECRET);

          res.status(201).json({
            message: "Logged in successfully",
            token,
          });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500),
        json({
          message: "Internal Server Error",
        });
    }
  },

  userProfile: async (req, res) => {
    try {
      const _id = req.userId;

      const user = await User.findOne({ _id }).select("-password");
      if (!user || !user.isActive) {
        return res.status(404).json({
          message: "User not found",
        });
      } else {
        return res.status(200).json(user);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  checkUsername: async (req, res) => {
    try {
      const input = req.query.username;
      const user = await User.findOne({ username: input });
      if (user.username) {
        return res.json({
          message: "Username already taken",
        });
      } else {
        return res.json({
          message: "Username validated",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  checkEmail: async (req, res) => {
    try {
      const input = req.query.email;
      const user = await User.findOne({ email: input });
      if (
        !input.includes("@") ||
        !input.includes(".") ||
        !input.includes("mail")
      ) {
        return res.json({
          message: "Invalid email address",
        });
      } else if (user) {
        return res.json({
          message: "Email already taken",
        });
      } else {
        return res.json({
          message: "Email validated",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  editUserProfile: async (req, res) => {
    try {
      const _id = req.userId;
      const { name, phoneNumber } = req.body;
      const user = await User.findOne({ _id });

      if (!user) {
        res.status(404).json({
          message: "User not found",
        });
      } else {
        if (user?.profileImage) {
          await cloudinary.api.delete_resources(`tv_profileImages/${_id}`);
        }
        const imageBuffer = req.file.buffer;
        const uploadOptions = {
          folder: "tv_profileImages",
          public_id: user?.username,
        };
        const uploadedImage = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => {
              if (error) throw new Error(error);
              else return resolve(result);
            }
          );
          streamify.createReadStream(imageBuffer).pipe(uploadStream);
        });

        const profileImage = uploadedImage.secure_url;

        const updatedUser = {
          name: name ? name : user.name,
          profileImage: profileImage ? profileImage : user.profileImage,
          phoneNumber: phoneNumber ? phoneNumber : user.phoneNumber,
        };

        await User.findByIdAndUpdate(_id, updatedUser);
        res.status(201).json({
          message: "User updated successfully",
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      const _id = req.userId;
      const { oldPassword, newPassword } = req.body;

      const user = await User.findOne({ _id });

      const matchPassword = await bcrypt.compare(oldPassword, user.password);

      if (!matchPassword) {
        return res.status(401).json({
          message: "Invalid Password",
        });
      } else {
        const hashedPassword = await bcrypt.hash(newPassword, 7);

        await User.findByIdAndUpdate(_id, { password: hashedPassword });
        return res.status(201).json({
          message: "Password changed successfully",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  },
};

module.exports = UserController;
