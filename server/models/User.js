const mongoose = require('mongoose');

// Schema defines the structure of a user document in MongoDB
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,  // No two users can have the same email
    lowercase: true
  },
  password: {
    type: String,
    required: true  // Will be stored as a hashed value, not plain text
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

const User = mongoose.model('User', userSchema);

module.exports = User;

/*
 * FILE EXPLANATION:
 * This file defines the User model (structure) for MongoDB.
 * Each user has a name, email, and password.
 * The email must be unique so two people can't register with the same email.
 * We use mongoose.model() to create a model that lets us do database operations.
 * This model is used in the auth controller for registration and login.
 */
