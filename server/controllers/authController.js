const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password before saving (never store plain text passwords)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = await User.create({ name, email, password: hashedPassword });

    // Create a JWT token so the user is logged in right after registering
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login an existing user
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare entered password with the hashed password in database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create a JWT token for the session
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { register, login };

/*
 * FILE EXPLANATION:
 * This file handles user registration and login.
 *
 * register() - Creates a new user account.
 *   It checks if the email is already used, hashes the password for security,
 *   saves the user to MongoDB, and returns a JWT token.
 *
 * login() - Logs in an existing user.
 *   It finds the user by email, checks if the password matches the stored hash,
 *   and returns a JWT token if everything is correct.
 *
 * JWT (JSON Web Token) is like a digital ID card. Once logged in, the user
 * sends this token with every request to prove who they are.
 *
 * bcrypt is used to hash passwords so even if the database is hacked,
 * passwords are not readable.
 */
