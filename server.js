const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const roomRoutes = require("./routes/roomRoutes");
require("dotenv").config(); // Load environment variables from .env

const app = express();
const port = process.env.PORT || 3000;
// const mongoUri = "mongodb://127.0.0.1:27017/booking_db";
const mongoUri = process.env.MONGO_URI; // Use the environment variable

// Middleware
app.use(cors());
app.use(express.json());
app.use(
  session({ secret: "your-secret-key", resave: false, saveUninitialized: true })
);

// Database connection
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

// Routes
app.use("/booking", bookingRoutes);
app.use("/auth", authRoutes);
app.use("/rooms", roomRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
});
