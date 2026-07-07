// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// General JWT authentication middleware (Customers & Admins)
function authenticateJWT(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied, token missing!' });
  }

  try {
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    if (!verifiedUser.id) {
      return res.status(400).json({ success: false, message: 'Invalid token structure!' });
    }
    req.user = verifiedUser;
    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    return res.status(403).json({ success: false, message: 'Invalid or expired token!' });
  }
}

// JWT authentication middleware for Admins only
function authenticateAdminJWT(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied, token missing!' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Admin Authentication Error:', err.message);
      return res.status(403).json({ success: false, message: 'Invalid or expired token!' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied, admin only!' });
    }
    req.user = user;
    next();
  });
}

module.exports = { authenticateJWT, authenticateAdminJWT };
