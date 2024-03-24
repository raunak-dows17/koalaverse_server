const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("../config/db");
const userRouter = require("./routes/userRoutes");
const storyRouter = require("./routes/storyRoutes");
const contributionRouter = require("./routes/contributionRoutes");

const app = express();
const port = process.env.PORT || 9696;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to Koalatale's Serverse");
});

app.use("/api/auth", userRouter);
app.use("/api/story", storyRouter);
app.use("/api/contribution", contributionRouter);

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}/`);
});
