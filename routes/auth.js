// routes/authenticate.js
const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

// Middleware to require admin role
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).send("Permission denied.");
  }
}

// Registration for admin user
router.post("/register-admin", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: hashedPassword,
      role: "admin",
    });
    await user.save();
    res.status(201).send("Admin user registered successfully.");
  } catch (error) {
    res.status(500).send("Error registering admin user.");
  }
});

// Admin dashboard route
router.get("/admin/dashboard", requireAdmin, (req, res) => {
  res.send("Admin dashboard.");
});

// Regular user dashboard route
// router.get("/user/dashboard", (req, res) => {
//   res.send("User dashboard.");
// });

// Login route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).send("Invalid password.");
    }

    // At this point, the login is successful
    // You would typically use JWT here to generate a token
    // For simplicity, let's assume a successful login response
    res.send("Login successful.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error during login.");
  }
});

module.exports = router;
