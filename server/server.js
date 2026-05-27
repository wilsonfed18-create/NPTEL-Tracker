const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');

const app = express();

// Middleware - allows JSON data and cross-origin requests from React frontend
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err);
  });

/*
 * FILE EXPLANATION:
 * This is the main entry point of the backend server.
 * It sets up Express, connects to MongoDB, and registers all routes.
 * cors() allows the React frontend (running on a different port) to talk to this server.
 * express.json() lets us read JSON data sent in request bodies.
 * We split routes into auth (login/register) and courses (CRUD operations).
 */
