const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/");

const { connection } = mongoose;

connection.on("error", (err) => console.error(err));

connection.on("close", () => console.log("Connection closed with Database"));

connection.once("open", () =>
  console.log("Connection Established with Database")
);
