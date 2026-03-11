/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user/driver info to the request.
 * Supports both User and Driver authentication via a unified token scheme.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Driver = require('../models/Driver');

const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — no token provided',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the authenticated entity to the request
    if (decoded.role === 'driver') {
      const driver = await Driver.findById(decoded.id);
      if (!driver || !driver.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Driver account not found or deactivated',
        });
      }
      req.user = { ...driver.toObject(), role: 'driver' };
      req.driver = driver;
    } else {
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account not found or deactivated',
        });
      }
      req.user = user;
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired — please log in again',
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

module.exports = { protect };
