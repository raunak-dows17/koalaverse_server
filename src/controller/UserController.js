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
        return res.status(401).send("User already exists");
      } else {
        if (!name) {
          return res.status(401).json({
            message: "Name is required",
          });
        }
        if (!username) {
          return res.status(401).json({
            message: "Username is required",
          });
        }
        if (!email) {
          return res.status(401).json({
            message: "Email is required",
          });
        }
        if (!phoneNumber) {
          return res.status(401).json({
            message: "Phone Number is required",
          });
        }
        if (!password) {
          return res.status(401).json({
            message: "Password is required",
          });
        }
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

        return res.status(201).send({
          message: "User registered successfully",
          token,
        });
      }
    } catch (error) {
      console.error(error?.message);
      return res.status(500).send({
        message: "Internal Server Error",
      });
    }
  },

  userLogin: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      } else {
        if (!this.checkUsername) {
          return res.status(401).json({
            message: "Username is required",
          });
        }
        if (!password) {
          return res.status(401).json({
            message: "Password is required",
          });
        }
        const matchPassword = await bcrypt.compare(password, user.password);

        if (!matchPassword) {
          return res.status(401).json({
            message: "Invalid Username or Password",
          });
        } else {
          const payload = {
            userId: user._id,
          };

          const token = jwt.sign(payload, process.env.JWT_SECRET);

          return res.status(201).json({
            message: "Logged in successfully",
            token,
          });
        }
      }
    } catch (error) {
      console.error(error);
      return (
        res.status(500),
        json({
          message: "Internal Server Error",
        })
      );
    }
  },

  loggedInUserProfile: async (req, res) => {
    try {
      const { userId } = req;

      const user = await User.findById(userId)
        .select("-password")
        .populate("stories")
        .populate({
          path: "contributions",
          populate: [
            {
              path: "storyFor",
              select: "title, content",
            },
            {
              path: "votes",
              select: "name username",
            },
          ],
        });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  },

  userProfile: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId)
        .select("-password")
        .populate("stories")
        .populate({
          path: "contributions",
          populate: [
            {
              path: "storyFor",
              select: "title, content",
            },
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
      if (!user || !user.isActive) {
        return res.status(404).json({
          message: "User not found",
        });
      } else {
        return res.status(200).json(user);
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  },

  checkUsername: async (req, res) => {
    try {
      const { username } = req.query;
      const user = await User.findOne({ username });
      if (user) {
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
      const { email } = req.query;
      const user = await User.findOne({ email });
      const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
      if (!regex.test(email)) {
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
        return res.status(404).json({
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
        return res.status(201).json({
          message: "User updated successfully",
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({
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
