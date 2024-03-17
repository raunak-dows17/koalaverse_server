const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "taleverse",
  api_key: "912143262294777",
  api_secret: "hhRwe1MQIyoevAqy1Kn0tpDVdUg",
});

module.exports = cloudinary;
