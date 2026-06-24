const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// POST /api/register
router.post('/register', async (req, res) => {
  try {
    const { User_ID, Password } = req.body;

    if (!User_ID || !Password) {
      return res.status(400).json({ status: "error", message: "User_ID and Password are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ User_ID });
    if (existingUser) {
      return res.status(400).json({ status: "error", message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create user
    const newUser = new User({ User_ID, Password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ status: "success", message: "Registration successful" });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// POST /api/login
router.post('/login', async (req, res) => {
  try {
    const { User_ID, Password } = req.body;

    if (!User_ID || !Password) {
      return res.status(400).json({ status: "not", message: "User_ID and Password are required" });
    }

    const user = await User.findOne({ User_ID });
    if (!user) {
      return res.json({ status: "not", message: "User not found" });
    }

    // Verify password (check if bcrypt hashed, or fallback to plain text comparison)
    let isMatch = false;
    if (user.Password.startsWith('$2a$') || user.Password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(Password, user.Password);
    } else {
      isMatch = user.Password === Password;
    }

    if (isMatch) {
      return res.json({ status: "Legitimate" });
    } else {
      return res.json({ status: "not", message: "Invalid credentials" });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: "not", error: "Internal server error" });
  }
});

module.exports = router;
