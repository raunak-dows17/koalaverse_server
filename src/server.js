const express = require("express");
require("dotenv").config();
require("../config/db");
const userRouter = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 9696;

app.get("/", (req, res) => {
  res.send("Welcome to Taleverse's Serverse");
});

app.use(express.json());
app.use("/api/auth", userRouter);

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}/`);
});
