const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    // Fetch user from database using user ID from JWT payload
    try {
      const userData = await User.findById(user.userId);
      if (!userData) {
        return res.sendStatus(401); // User not found
      }
      req.user = userData; // Attach user data to request object
      next();
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.sendStatus(500);
    }
  });
};

module.exports = { authenticateToken };
