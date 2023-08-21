const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt"); // for password hashing

const bookingRoutes = require("./routes/bookingRoutes");

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = "mongodb://127.0.0.1:27017";

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: "booking_db",
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Use booking routes
app.use("/booking", bookingRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
});
