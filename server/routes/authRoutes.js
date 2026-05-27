const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// POST /api/auth/register - Create a new account
router.post('/register', register);

// POST /api/auth/login - Login with email and password
router.post('/login', login);

module.exports = router;

/*
 * FILE EXPLANATION:
 * This file defines the URL routes for authentication.
 * /register calls the register function from authController.
 * /login calls the login function from authController.
 * express.Router() lets us group related routes together cleanly.
 */
