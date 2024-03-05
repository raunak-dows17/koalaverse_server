const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 9696;

app.get("/", (req, res) => {
  res.send("Welcome to Taleverse's Serverse");
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}/`);
});
