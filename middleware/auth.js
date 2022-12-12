const jwt = require("jsonwebtoken");

// Get Environment Variables
const config = process.env;

// Verify Token
const verifyToken = (req, res, next) => {
  // Get Token from Header or Body or Query or Cookie (in that order)
  const token = req.body.token || req.query.token || req.headers["x-access-token"] || req.cookies.token;

  // If no token, return error
  if (!token) {
    req.auth = false;
    req.authMessage = 'A token is required for authentication';
  }

  try {
    // Verify Token and Decode
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.auth = true;
    req.user = decoded;
  } catch (err) {
    req.auth = false;
    req.authMessage = 'Invalid Token';
  }
  return next();
};

// Export Module for use in other files (routes)
module.exports = verifyToken;