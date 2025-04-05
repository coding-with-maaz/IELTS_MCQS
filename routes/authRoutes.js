const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, register, getCurrentUser } = require('../controllers/authController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name', 'Name is required').not().isEmpty(),
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Please enter a password with 8 or more characters').isLength({ min: 8 }),
  body('testType', 'Test type is required and must be either IELTS or PTE').isIn(['IELTS', 'PTE'])
], register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email', 'Please include a valid email').isEmail(),
  body('password', 'Password is required').exists()
], login);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getCurrentUser);

// @route   POST api/auth/logout
// @desc    Logout user / Clear cookie
// @access  Private
router.post('/logout', protect, (req, res) => {
  try {
    // Clear all cookies
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0)
    });
    
    res.clearCookie('auth_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0)
    });
    
    // Send success response
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error during logout' 
    });
  }
});

module.exports = router;