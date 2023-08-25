// server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session"); // Add this import

const authRoutes = require("./routes/auth");
const bookingRoutes = require("./routes/bookingRoutes");
const roomRoutes = require("./routes/roomRoutes");
const Room = require("./models/Room"); // Import the Room model

const app = express();
const port = process.env.PORT || 3000;
const mongoUri = "mongodb://127.0.0.1:27017/booking_db"; // Update your MongoDB URI

app.use(cors());
app.use(express.json());
app.use(
  session({ secret: "your-secret-key", resave: false, saveUninitialized: true })
);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});
// Mock user middleware
app.use((req, res, next) => {
  // In a real application, you would use authentication mechanisms like JWT
  // Here, we're just setting a mock user for demonstration purposes
  req.user = { role: "admin" }; // Change the role as needed
  next();
});

// Use booking routes
app.use("/booking", bookingRoutes);
app.use("/auth", authRoutes);
// Use the roomRoutes middleware
app.use("/rooms", roomRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://127.0.0.1:${port}`);
});
