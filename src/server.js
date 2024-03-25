const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
require("../config/db");
const userRouter = require("./routes/userRoutes");
const storyRouter = require("./routes/storyRoutes");
const contributionRouter = require("./routes/contributionRoutes");

const app = express();
const port = process.env.PORT || 9696;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "./view/assets")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./view/index.html"));
});

app.use("/api/auth", userRouter);
app.use("/api/story", storyRouter);
app.use("/api/contribution", contributionRouter);

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}/`);
});
