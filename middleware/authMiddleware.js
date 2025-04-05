const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// Protect routes - Authentication
exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // Check for token in cookies first
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
    console.log('Token found in cookies');
  }
  // Then check authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found in Authorization header');
  }
  // Finally check x-auth-token header
  else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'];
    console.log('Token found in x-auth-token header');
  }

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Clean the token by removing any whitespace
    token = token.trim();
    
    // Log the token format for debugging
    console.log('Token format:', token.substring(0, 20) + '...');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    console.log('Token verified successfully:', decoded);

    // Get user from token using _id
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user and testType to request
    req.user = user;
    req.testType = user.profile?.testType;
    console.log('User testType from profile:', user.profile?.testType);
    console.log('Final testType used:', req.testType);
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    console.error('Token that caused error:', token);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

// Restrict to specific roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'user', etc]
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Admin middleware
exports.isAdmin = catchAsync(async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    throw new AppError('Admin access required', 403);
  }
  next();
}); 