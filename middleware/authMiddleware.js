// middleware/authMiddleware.js
const bcrypt = require("bcrypt");
const User = require("../models/User");

// Middleware to check if the user is authenticated
const isAuthenticated = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Store user details in the request for later use
    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { isAuthenticated };
