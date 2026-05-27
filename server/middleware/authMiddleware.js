const jwt = require('jsonwebtoken');

// This middleware checks if the user is logged in before allowing access to protected routes
const protect = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, access denied' });
  }

  // Extract the token (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token using our secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Attach userId to request so controllers can use it
    next(); // Move on to the actual route handler
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = protect;

/*
 * FILE EXPLANATION:
 * This is a middleware function that protects routes from unauthorized access.
 * When a user logs in, they get a JWT token. They must send this token with every request.
 * This function checks if the token is valid before allowing the request to continue.
 * If the token is missing or wrong, it sends back a 401 (Unauthorized) error.
 * req.userId is set so that controllers know which user is making the request.
 * next() tells Express to move on to the next function (the actual route handler).
 */
