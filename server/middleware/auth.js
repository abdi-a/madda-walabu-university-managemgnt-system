const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const instructorAuthMiddleware = (req, res, next) => {
  try {
    // First run the general auth middleware
    authMiddleware(req, res, () => {
      // Check if user is an instructor
      if (req.user.role !== 'instructor') {
        return res.status(403).json({ message: 'Access denied. Not an instructor.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Authorization failed' });
  }
};

module.exports = {
  authMiddleware,
  instructorAuthMiddleware
}; 