// Import necessary modules and User model

const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { isAuthenticated } = require("../middleware/authMiddleware");
const { errorHandler } = require("../utils/helpers.js");

const router = express.Router();

// Function to create a default user
async function createDefaultUser() {
  try {
    const defaultUsername = "Sokxay"; // Set your default username
    const defaultPassword = "Sokxay@2023"; // Set your default password

    // Check if a user with the default username already exists
    const existingUser = await User.findOne({ username: defaultUsername });

    if (existingUser) {
      console.log("Default user already exists");
      return;
    }

    // Hash the default password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create a new default user
    const newUser = new User({
      username: defaultUsername,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("Default user created successfully");
  } catch (error) {
    console.error("Error creating default user:", error);
  }
}

// Create a default user when the server starts
createDefaultUser();

// User registration route
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if a user with the provided username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ error: "Username is already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    errorHandler(res, error);
  }
});

// User login with the isAuthenticated middleware
router.post("/login", isAuthenticated, (req, res) => {
  res.status(200).json({ message: "Login successful", user: req.user });
});

module.exports = router;
