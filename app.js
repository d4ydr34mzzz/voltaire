const express = require("express");
const app = express();
const mongoose = require("mongoose");
const port = process.env.PORT || 3000;
require("dotenv").config();

// Get the appropriate MongoDB URI (development, testing, or production)
const { mongoURI } = require("./config/database.js");

// Connect to MongoDB
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB connected ...");
  })
  .catch((error) => {
    console.log("There was an error connecting to MongoDB: " + error);
  });

app.get("/", (req, res) => {
  res.send("Foxglove");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
