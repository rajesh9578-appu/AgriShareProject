const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-otp.codeHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-otp.codeHash');
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (e) {
      // Ignore token error for optional auth
    }
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for this operation.'
      });
    }

    // Admins have access across all standard roles
    if (req.user.role === 'admin') {
      return next();
    }

    // Common 'user' role has access to all seeker and provider activities
    if (roles.includes('user') || roles.includes('resource_owner') || roles.includes('farmer')) {
      if (req.user.role === 'user' || req.user.role === 'farmer' || req.user.role === 'resource_owner') {
        return next();
      }
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource.`
      });
    }

    next();
  };
};

const requireVerified = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      isUnverified: true,
      message: 'Please verify your email address with OTP before proceeding.'
    });
  }

  next();
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  requireVerified
};
