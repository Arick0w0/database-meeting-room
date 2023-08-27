const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { isAuthenticated } = require("../middleware/authMiddleware");

const router = express.Router();

// User registration
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// User login with the isAuthenticated middleware
router.post("/login", isAuthenticated, (req, res) => {
  res.status(200).json({ message: "Login successful", user: req.user });
});

module.exports = router;
